/**
 * Zoho OAuth — server-side, single mailbox.
 *
 * FIBI is not asking end users to log into Zoho. There is exactly one Zoho
 * mailbox that sends platform mail (password resets, membership decisions), so
 * this is a one-time authorization by an admin, after which the server holds a
 * long-lived refresh token and mints hourly access tokens on its own.
 *
 * Two places the refresh token can live, checked in this order:
 *   1. ZOHO_REFRESH_TOKEN in the environment — for ops that inject secrets
 *      directly and never want a browser flow touching production.
 *   2. The OAuthCredential row written by the /connect → /oauth/callback flow.
 *
 * Zoho hands out a limited number of refresh tokens per client (20 at the time
 * of writing) and does not expire them. Re-running the connect flow repeatedly
 * will eventually exhaust that quota, which is why disconnect revokes rather
 * than just deleting the row.
 */

const axios = require('axios');
const { prisma } = require('../config/db');
const config = require('../config/env');

const PROVIDER = 'zoho';

/**
 * Access tokens are valid for an hour. Treating them as expired a minute early
 * removes the race where a token passes the check here and is rejected by Zoho
 * moments later, mid-send.
 */
const EXPIRY_SKEW_MS = 60 * 1000;

/** In-process access token cache: { token, expiresAt }. */
let cachedAccess = null;

/** Zoho account id, discovered once per process. Never changes for an account. */
let cachedAccountId = null;

function accountsBase() {
    return String(config.ZOHO_ACCOUNTS_DOMAIN).replace(/\/+$/, '');
}

function mailApiBase() {
    return String(config.ZOHO_MAIL_API_DOMAIN).replace(/\/+$/, '');
}

/** Client credentials present — says nothing about whether anyone has authorized yet. */
function isConfigured() {
    return Boolean(config.ZOHO_CLIENT_ID && config.ZOHO_CLIENT_SECRET && config.ZOHO_REDIRECT_URI);
}

/**
 * Whether outbound mail should go through Zoho OAuth rather than plain SMTP
 * password auth. Deliberately keyed on configuration, not on whether a token
 * happens to be stored: if an operator configured Zoho but never completed the
 * connect flow, mail must fail loudly with "not connected" instead of silently
 * falling back to a different transport.
 */
function isEnabled() {
    return isConfigured() && Boolean(config.ZOHO_MAIL_USER);
}

/**
 * The URL the admin's browser is sent to in order to grant access.
 *
 * `access_type=offline` together with `prompt=consent` is what makes Zoho
 * return a refresh_token. Without both, the exchange yields only a one-hour
 * access token and the integration dies quietly 60 minutes later.
 */
function buildAuthorizeUrl(state) {
    const params = new URLSearchParams({
        client_id: config.ZOHO_CLIENT_ID,
        response_type: 'code',
        scope: config.ZOHO_SCOPE,
        redirect_uri: config.ZOHO_REDIRECT_URI,
        access_type: 'offline',
        prompt: 'consent',
        state,
    });

    return `${accountsBase()}/oauth/v2/auth?${params.toString()}`;
}

/**
 * Zoho answers token failures with HTTP 200 and an `error` key in the body,
 * so axios never throws and a naive caller reads a "success" with no token.
 * Every response from the token endpoint goes through here.
 */
async function postToTokenEndpoint(fields) {
    const { data } = await axios.post(
        `${accountsBase()}/oauth/v2/token`,
        new URLSearchParams(fields).toString(),
        {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000,
            // Read the body ourselves rather than letting a 4xx throw an error
            // whose message hides Zoho's actual reason.
            validateStatus: () => true,
        }
    );

    if (!data || data.error) {
        const reason = (data && data.error) || 'unknown_error';
        throw new Error(`Zoho rejected the token request: ${reason}`);
    }

    return data;
}

/** One-time: turn the ?code= from the callback into a permanent refresh token. */
async function exchangeCodeForTokens(code) {
    const data = await postToTokenEndpoint({
        grant_type: 'authorization_code',
        client_id: config.ZOHO_CLIENT_ID,
        client_secret: config.ZOHO_CLIENT_SECRET,
        redirect_uri: config.ZOHO_REDIRECT_URI,
        code,
    });

    if (!data.refresh_token) {
        throw new Error(
            'Zoho returned no refresh_token. This happens when the app was already ' +
                'authorized — revoke it under Zoho Accounts → Security → Connected Apps ' +
                'and run the connect flow again.'
        );
    }

    return {
        refreshToken: data.refresh_token,
        accessToken: data.access_token,
        expiresInSec: Number(data.expires_in) || 3600,
        scope: data.scope || config.ZOHO_SCOPE,
    };
}

async function persistRefreshToken({ refreshToken, scope, accountEmail, connectedById, connectedByEmail }) {
    const record = await prisma.oAuthCredential.upsert({
        where: { provider: PROVIDER },
        create: {
            provider: PROVIDER,
            refreshToken,
            scope,
            accountEmail,
            connectedById: connectedById || null,
            connectedByEmail: connectedByEmail || null,
        },
        update: {
            refreshToken,
            scope,
            accountEmail,
            connectedById: connectedById || null,
            connectedByEmail: connectedByEmail || null,
            connectedAt: new Date(),
        },
    });

    // A newly stored refresh token invalidates whatever the old one minted.
    cachedAccess = null;

    return record;
}

async function loadRefreshToken() {
    if (config.ZOHO_REFRESH_TOKEN) return config.ZOHO_REFRESH_TOKEN;

    const record = await prisma.oAuthCredential.findUnique({
        where: { provider: PROVIDER },
        select: { refreshToken: true },
    });

    return record ? record.refreshToken : null;
}

/**
 * A valid access token, minted from the refresh token and cached until it is
 * close to expiring. Callers do not need to know or care whether this hit the
 * cache or the network.
 */
async function getAccessToken() {
    if (!isConfigured()) {
        throw new Error('Zoho OAuth is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REDIRECT_URI.');
    }

    if (cachedAccess && cachedAccess.expiresAt - EXPIRY_SKEW_MS > Date.now()) {
        return cachedAccess.token;
    }

    const refreshToken = await loadRefreshToken();
    if (!refreshToken) {
        throw new Error(
            'Zoho is configured but not connected. An admin must open ' +
                'GET /api/v1/zoho/connect once to authorize the mailbox.'
        );
    }

    const data = await postToTokenEndpoint({
        grant_type: 'refresh_token',
        client_id: config.ZOHO_CLIENT_ID,
        client_secret: config.ZOHO_CLIENT_SECRET,
        refresh_token: refreshToken,
    });

    if (!data.access_token) {
        throw new Error('Zoho refresh succeeded but returned no access_token.');
    }

    const expiresInSec = Number(data.expires_in) || 3600;
    cachedAccess = {
        token: data.access_token,
        expiresAt: Date.now() + expiresInSec * 1000,
    };

    return cachedAccess.token;
}

/**
 * The Zoho account behind the token, including the addresses it is permitted to
 * send from. `fromAddress` on a send must be one of those — a mailbox that
 * resolves in DNS but is not provisioned on the account is rejected, which is
 * the single most common way this integration is misconfigured.
 */
async function fetchAccount() {
    const token = await getAccessToken();

    const { status, data } = await axios.get(`${mailApiBase()}/api/accounts`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
        timeout: 20000,
        validateStatus: () => true,
    });

    const account = data && Array.isArray(data.data) ? data.data[0] : null;
    if (status !== 200 || !account) {
        throw new Error(`Zoho accounts lookup failed (HTTP ${status}).`);
    }

    return {
        accountId: account.accountId,
        primaryEmail: account.primaryEmailAddress,
        fromAddresses: (account.sendMailDetails || []).map((entry) => entry.fromAddress).filter(Boolean),
    };
}

async function getAccountId() {
    if (config.ZOHO_ACCOUNT_ID) return config.ZOHO_ACCOUNT_ID;
    if (cachedAccountId) return cachedAccountId;

    cachedAccountId = (await fetchAccount()).accountId;
    return cachedAccountId;
}

/**
 * Send one message through the Zoho Mail API.
 *
 * Not SMTP: Zoho's SMTP servers reject the XOAUTH2 handshake outright with
 * "501 Could not do Unknown Authentication", because OAuth on Zoho Mail is
 * scoped for the REST API rather than SMTP. SMTP remains available in this
 * codebase, but only with an app-specific password — see mailer.service.js.
 */
async function sendMessage({ from, to, subject, text, html }) {
    const token = await getAccessToken();
    const accountId = await getAccountId();

    const { status, data } = await axios.post(
        `${mailApiBase()}/api/accounts/${accountId}/messages`,
        {
            fromAddress: from,
            toAddress: to,
            subject,
            content: html || text,
            mailFormat: html ? 'html' : 'plaintext',
        },
        {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`,
                'Content-Type': 'application/json',
            },
            timeout: 25000,
            validateStatus: () => true,
        }
    );

    // As with the token endpoint, Zoho reports failures inside the body as
    // readily as through the status line, so both are checked.
    const description = data && data.status ? data.status.description : null;
    if (status !== 200 || (description && description !== 'success')) {
        throw new Error(
            `Zoho refused the message (HTTP ${status}${description ? `, ${description}` : ''}). ` +
                `Check that "${from}" is one of the account's permitted from-addresses.`
        );
    }

    return { messageId: data && data.data ? data.data.messageId : undefined };
}

/** Connection state for the admin console. Never exposes the token itself. */
async function getStatus() {
    const record = await prisma.oAuthCredential
        .findUnique({
            where: { provider: PROVIDER },
            select: { accountEmail: true, scope: true, connectedAt: true, connectedByEmail: true, updatedAt: true },
        })
        .catch(() => null);

    const connected = Boolean(config.ZOHO_REFRESH_TOKEN || record);

    // Best-effort: a live lookup of what the account may actually send as. This
    // is the check that catches a ZOHO_MAIL_USER pointing at a mailbox the Zoho
    // account does not own — invisible until a send fails otherwise. A failure
    // here must not turn the status endpoint into a 500.
    let account = null;
    let accountError = null;
    if (connected) {
        try {
            account = await fetchAccount();
        } catch (error) {
            accountError = error.message;
        }
    }

    const canSendAs =
        account && config.ZOHO_MAIL_USER
            ? account.fromAddresses.some((a) => a.toLowerCase() === config.ZOHO_MAIL_USER.toLowerCase())
            : null;

    return {
        configured: isConfigured(),
        enabledForMail: isEnabled(),
        connected,
        source: config.ZOHO_REFRESH_TOKEN ? 'env' : record ? 'database' : null,
        mailUser: config.ZOHO_MAIL_USER || null,
        // The stored column is only a snapshot from connect time; the configured
        // sender is the value actually used to send.
        accountEmail: (record && record.accountEmail) || config.ZOHO_MAIL_USER || null,
        scope: record ? record.scope : config.ZOHO_SCOPE,
        connectedAt: record ? record.connectedAt : null,
        connectedByEmail: record ? record.connectedByEmail : null,
        primaryEmail: account ? account.primaryEmail : null,
        allowedFromAddresses: account ? account.fromAddresses : null,
        /** null when unknown; false means every send will be rejected. */
        canSendAsMailUser: canSendAs,
        accountError,
    };
}

/**
 * Revoke at Zoho, then drop the row. Revocation comes first and its failure is
 * swallowed: if Zoho is unreachable we still want the local credential gone,
 * and a stale token counting against the per-client quota is the lesser problem
 * compared to leaving a live credential in our database.
 */
async function disconnect() {
    const refreshToken = await loadRefreshToken();

    if (refreshToken && !config.ZOHO_REFRESH_TOKEN) {
        await axios
            .post(
                `${accountsBase()}/oauth/v2/token/revoke`,
                new URLSearchParams({ token: refreshToken }).toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 15000,
                    validateStatus: () => true,
                }
            )
            .catch((error) => {
                console.error('[zoho] revoke failed, deleting local credential anyway:', error.message);
            });
    }

    cachedAccess = null;
    cachedAccountId = null;

    await prisma.oAuthCredential.deleteMany({ where: { provider: PROVIDER } });
}

module.exports = {
    PROVIDER,
    isConfigured,
    isEnabled,
    buildAuthorizeUrl,
    exchangeCodeForTokens,
    persistRefreshToken,
    getAccessToken,
    fetchAccount,
    getAccountId,
    sendMessage,
    getStatus,
    disconnect,
};
