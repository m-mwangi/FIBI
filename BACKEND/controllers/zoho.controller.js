/**
 * Zoho mailbox connect flow.
 *
 * Three endpoints, only one of which Zoho ever calls:
 *   GET  /api/v1/zoho/connect         admin starts here, redirects to Zoho
 *   GET  /api/v1/zoho/oauth/callback  Zoho redirects back here with ?code=
 *   GET  /api/v1/zoho/status          what the admin console reads
 *   POST /api/v1/zoho/disconnect      revoke and forget
 *
 * The callback cannot be behind `protect`: it is a top-level navigation from
 * Zoho's domain, and gating it on a cookie that a stricter SameSite policy may
 * drop would break the flow for reasons that are painful to diagnose. Instead
 * the admin identity is carried in a short-lived signed `state` token minted at
 * /connect and verified here — which is also the CSRF defence the OAuth spec
 * asks for, so it does double duty.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const zohoOAuth = require('../services/zohoOAuth.service');
const { recordAudit } = require('../utils/audit');

/** Long enough to read a consent screen, short enough that a leaked URL is stale. */
const STATE_TTL = '10m';
const STATE_PURPOSE = 'zoho-oauth-connect';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * The callback renders HTML rather than JSON: the audience is an admin sitting
 * in a browser at the end of a redirect chain, not a fetch() caller.
 */
function resultPage(res, statusCode, { ok, title, detail }) {
    const accent = ok ? '#059669' : '#dc2626';

    res.status(statusCode).type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:12vh auto;padding:32px 28px;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(15,23,42,.1)">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${accent};margin:0 0 8px;font-weight:600">FIBI · Zoho Mail</p>
    <h1 style="font-size:21px;margin:0 0 14px;color:#0f172a">${escapeHtml(title)}</h1>
    <p style="margin:0;line-height:1.65;color:#475569;font-size:15px">${escapeHtml(detail)}</p>
  </div>
</body>
</html>`);
}

/**
 * Send the admin to Zoho's consent screen.
 *
 * A 302 rather than a JSON payload containing the URL, so an admin can reach
 * this by simply opening the endpoint in a browser — the connect flow has to be
 * usable before any admin UI exists for it.
 */
const startZohoConnect = async (req, res, next) => {
    try {
        if (!zohoOAuth.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'Zoho OAuth is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REDIRECT_URI.',
            });
        }

        const state = jwt.sign(
            { purpose: STATE_PURPOSE, adminId: req.user.id, adminEmail: req.user.email },
            config.JWT_SECRET,
            { expiresIn: STATE_TTL }
        );

        return res.redirect(zohoOAuth.buildAuthorizeUrl(state));
    } catch (error) {
        next(error);
    }
};

const zohoCallback = async (req, res, next) => {
    try {
        const { code, state, error: providerError } = req.query;

        // The admin pressed "Reject", or Zoho refused before consent.
        if (providerError) {
            return resultPage(res, 400, {
                ok: false,
                title: 'Authorization was not completed',
                detail: `Zoho returned: ${providerError}. Nothing was saved — you can start again from /api/v1/zoho/connect.`,
            });
        }

        if (!code || !state) {
            return resultPage(res, 400, {
                ok: false,
                title: 'Incomplete callback',
                detail: 'Zoho did not include an authorization code and state. Start the flow from /api/v1/zoho/connect rather than opening this URL directly.',
            });
        }

        let claims;
        try {
            claims = jwt.verify(state, config.JWT_SECRET);
        } catch {
            return resultPage(res, 400, {
                ok: false,
                title: 'This authorization link has expired',
                detail: 'The connect link is valid for 10 minutes. Start again from /api/v1/zoho/connect.',
            });
        }

        if (claims.purpose !== STATE_PURPOSE) {
            return resultPage(res, 400, {
                ok: false,
                title: 'Invalid authorization state',
                detail: 'The state token was not issued for the Zoho connect flow.',
            });
        }

        const tokens = await zohoOAuth.exchangeCodeForTokens(code);

        await zohoOAuth.persistRefreshToken({
            refreshToken: tokens.refreshToken,
            scope: tokens.scope,
            accountEmail: config.ZOHO_MAIL_USER || null,
            connectedById: claims.adminId,
            connectedByEmail: claims.adminEmail,
        });

        // recordAudit reads req.user, which this unauthenticated route does not
        // have. The signed state is the identity proof, so attach it.
        req.user = { id: claims.adminId, email: claims.adminEmail };
        recordAudit(req, {
            action: 'integration.zoho.connect',
            targetType: 'integration',
            targetId: zohoOAuth.PROVIDER,
            targetLabel: config.ZOHO_MAIL_USER || 'Zoho Mail',
            metadata: { scope: tokens.scope },
        });

        return resultPage(res, 200, {
            ok: true,
            title: 'Zoho Mail is connected',
            detail: `FIBI can now send mail as ${
                config.ZOHO_MAIL_USER || 'the authorized mailbox'
            }. The refresh token is stored server-side and renews itself — you will not need to repeat this unless the app is revoked in Zoho. You can close this tab.`,
        });
    } catch (error) {
        // The exchange failure messages are written for an operator and contain
        // no secrets, so surfacing them here saves a trip to the server logs.
        return resultPage(res, 502, {
            ok: false,
            title: 'Could not complete the token exchange',
            detail: error.message,
        });
    }
};

const zohoStatus = async (req, res, next) => {
    try {
        const status = await zohoOAuth.getStatus();
        res.status(200).json({ success: true, status });
    } catch (error) {
        next(error);
    }
};

const zohoDisconnect = async (req, res, next) => {
    try {
        await zohoOAuth.disconnect();

        recordAudit(req, {
            action: 'integration.zoho.disconnect',
            targetType: 'integration',
            targetId: zohoOAuth.PROVIDER,
            targetLabel: config.ZOHO_MAIL_USER || 'Zoho Mail',
        });

        res.status(200).json({ success: true, message: 'Zoho Mail disconnected' });
    } catch (error) {
        next(error);
    }
};

module.exports = { startZohoConnect, zohoCallback, zohoStatus, zohoDisconnect };
