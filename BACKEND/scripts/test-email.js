/**
 * SMTP diagnostic for the password-reset mailer.
 *
 *   npm run test-email                    # check config + connection + auth only
 *   npm run test-email -- you@example.com # also send a real reset-style email
 *
 * The no-argument form calls nodemailer's `verify()`, which opens the
 * connection, negotiates TLS and authenticates, then hangs up WITHOUT sending.
 * That is the fastest way to prove SMTP credentials work — the alternative is
 * driving the whole forgot-password flow, which needs a real account and burns
 * the 4-per-hour reset rate limit.
 *
 * The sending form deliberately calls the real `sendPasswordResetEmail` from
 * services/mailer.service.js rather than a parallel copy, so what you verify
 * here is exactly what production sends.
 */

const nodemailer = require('nodemailer');
const config = require('./../config/env');
const { sendPasswordResetEmail } = require('../services/mailer.service');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const ok = (m) => console.log(`${GREEN}✓${RESET} ${m}`);
const bad = (m) => console.log(`${RED}✗${RESET} ${m}`);
const warn = (m) => console.log(`${YELLOW}!${RESET} ${m}`);
const dim = (m) => console.log(`${DIM}${m}${RESET}`);

/** Maps an SMTP failure to the specific misconfiguration that causes it. */
function explain(err) {
    const code = err.code || '';
    const msg = String(err.message || '');
    const response = String(err.response || '');
    const all = `${msg} ${response}`.toLowerCase();

    if (code === 'EAUTH' || all.includes('authentication failed') || all.includes('invalid user')) {
        return [
            'Authentication was rejected. In order of likelihood:',
            '  1. Two-factor auth is on and SMTP_PASSWORD is the login password.',
            '     Zoho needs an app-specific password: Zoho Account -> Security -> App Passwords.',
            '  2. Wrong regional host. Your MX is mx.zoho.com, so this account is in',
            '     Zoho\'s US data centre and SMTP_HOST must be smtp.zoho.com',
            '     (not smtp.zoho.eu / .in / .com.au). A wrong region fails as bad credentials.',
            '  3. External SMTP is not enabled on your Zoho plan.',
            '     Check Zoho Mail -> Settings -> Mail Accounts -> IMAP/SMTP.',
        ];
    }

    if (all.includes('relaying disallowed') || response.startsWith('553')) {
        return [
            'Zoho accepted the login but refused the sender address.',
            `  MAIL_FROM is ${config.MAIL_FROM}`,
            `  SMTP_USER is ${config.SMTP_USER}`,
            '  The address inside MAIL_FROM must be the authenticated mailbox itself,',
            '  or an alias verified on that same Zoho account.',
        ];
    }

    if (['ETIMEDOUT', 'ECONNECTION', 'ESOCKET', 'ECONNREFUSED'].includes(code)) {
        return [
            'Could not open a connection to the mail server.',
            `  Host/port in use: ${config.SMTP_HOST}:${config.SMTP_PORT}`,
            '  Either the hostname is wrong, or outbound SMTP is blocked on this network.',
            '  Many VPS hosts block outbound mail ports by default and will unblock on request.',
            '  (Port 25 being blocked is normal and irrelevant here — this uses 587/465.)',
        ];
    }

    if (code === 'EDNS' || all.includes('getaddrinfo')) {
        return [`DNS could not resolve SMTP_HOST (${config.SMTP_HOST}). Check it for typos.`];
    }

    return [`Unrecognised SMTP failure. Raw error: ${msg}`];
}

async function main() {
    const recipient = process.argv[2];

    console.log('\nFIBI mailer diagnostic\n' + '─'.repeat(48));

    // ---- 1. configuration ----
    const missing = [];
    if (!config.SMTP_HOST) missing.push('SMTP_HOST');
    if (!config.SMTP_USER) missing.push('SMTP_USER');
    if (!config.SMTP_PASSWORD) missing.push('SMTP_PASSWORD');

    console.log(`  SMTP_HOST      ${config.SMTP_HOST || `${DIM}(unset)${RESET}`}`);
    console.log(`  SMTP_PORT      ${config.SMTP_PORT}`);
    console.log(`  SMTP_USER      ${config.SMTP_USER || `${DIM}(unset)${RESET}`}`);
    console.log(`  SMTP_PASSWORD  ${config.SMTP_PASSWORD ? `${DIM}(set, ${config.SMTP_PASSWORD.length} chars)${RESET}` : `${DIM}(unset)${RESET}`}`);
    console.log(`  MAIL_FROM      ${config.MAIL_FROM}`);
    console.log(`  FRONTEND_URL   ${config.FRONTEND_URL || `${DIM}(unset — reset links will use http://localhost:5173)${RESET}`}`);
    console.log('─'.repeat(48));

    if (missing.length > 0) {
        bad(`Not configured: ${missing.join(', ')}`);
        console.log('\nAdd these to BACKEND/.env, then run this again:\n');
        console.log('  SMTP_HOST=smtp.zoho.com');
        console.log('  SMTP_PORT=587');
        console.log('  SMTP_USER=no-reply@fibicommunity.org');
        console.log('  SMTP_PASSWORD=<app-specific password from Zoho>');
        console.log('  MAIL_FROM=FIBI <no-reply@fibicommunity.org>\n');
        dim('With SMTP_HOST unset the app is not broken — in development it prints');
        dim('reset emails to the server log instead of sending them.\n');
        process.exit(1);
    }

    // Catch the mismatch that produces Zoho's 553 before we even connect.
    const fromAddress = (config.MAIL_FROM.match(/<([^>]+)>/) || [null, config.MAIL_FROM])[1].trim();
    if (fromAddress.toLowerCase() !== String(config.SMTP_USER).toLowerCase()) {
        warn(`MAIL_FROM address (${fromAddress}) differs from SMTP_USER (${config.SMTP_USER}).`);
        dim('  Fine only if it is an alias verified on that Zoho account; otherwise Zoho');
        dim('  will reject the send with "553 Relaying disallowed".');
    }

    // ---- 2. connection + auth, without sending ----
    const transport = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
        requireTLS: config.SMTP_PORT !== 465,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
    });

    process.stdout.write(`\nConnecting to ${config.SMTP_HOST}:${config.SMTP_PORT} … `);
    try {
        await transport.verify();
        console.log('');
        ok(`Connected, TLS negotiated, and authenticated as ${config.SMTP_USER}`);
    } catch (err) {
        console.log('');
        bad('Connection or authentication failed.\n');
        explain(err).forEach((line) => console.log(`  ${line}`));
        console.log('');
        process.exit(1);
    }

    // ---- 3. optional real send, through the production code path ----
    if (!recipient) {
        console.log('');
        dim('Credentials are good. To send a real test email through the exact');
        dim('code path production uses:');
        dim('    npm run test-email -- you@example.com');
        console.log('');
        return;
    }

    process.stdout.write(`Sending a reset-style email to ${recipient} … `);
    try {
        const result = await sendPasswordResetEmail({
            to: recipient,
            name: 'Test Recipient',
            // Clearly marked so nobody mistakes this for a live reset link.
            resetUrl: `${(config.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/reset-password?token=DIAGNOSTIC_NOT_A_REAL_TOKEN`,
            expiresInMinutes: 30,
        });
        console.log('');
        if (result.delivered) {
            ok('Handed off to Zoho for delivery.');
            console.log('');
            dim('Now confirm deliverability, not just delivery: open the message in');
            dim('Gmail, choose "Show original", and check SPF, DKIM and DMARC all say');
            dim('PASS. All three passing is what keeps these out of the spam folder.');
        } else {
            warn('Logged to console instead of sent (SMTP not configured).');
        }
        console.log('');
    } catch (err) {
        console.log('');
        bad('Send failed.\n');
        explain(err).forEach((line) => console.log(`  ${line}`));
        console.log('');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('\nUnexpected error:', err.message, '\n');
    process.exit(1);
});
