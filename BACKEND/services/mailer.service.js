/**
 * Outbound mail.
 *
 * Three modes, in priority order:
 *   1. Zoho OAuth (ZOHO_CLIENT_ID + ZOHO_MAIL_USER set) — SMTP authenticated
 *      with a rotating XOAUTH2 access token instead of a stored password.
 *   2. Plain SMTP password auth, when SMTP_HOST is configured.
 *   3. With neither — the normal state on localhost — it writes the message to
 *      the server log so the reset flow is fully exercisable in development
 *      without a mail provider.
 *
 * The log fallback refuses to run in production: silently "sending" password
 * resets to a logfile on a live product would strand every locked-out user.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');
const zohoOAuth = require('./zohoOAuth.service');

let cachedTransport;

/** Zoho's SMTP endpoint, unless the deployment points SMTP_HOST somewhere else. */
const ZOHO_SMTP_HOST = 'smtp.zoho.com';
const ZOHO_SMTP_PORT = 465;

/**
 * Transport bound to the access token it was built with. Access tokens roll
 * hourly, and nodemailer captures the credential at construction time, so the
 * transport is rebuilt whenever the token underneath it changes.
 */
let cachedZohoTransport = null;

async function getZohoTransport() {
    const accessToken = await zohoOAuth.getAccessToken();

    if (cachedZohoTransport && cachedZohoTransport.accessToken === accessToken) {
        return cachedZohoTransport.transport;
    }

    const port = config.SMTP_HOST ? config.SMTP_PORT : ZOHO_SMTP_PORT;

    const transport = nodemailer.createTransport({
        host: config.SMTP_HOST || ZOHO_SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            type: 'OAuth2',
            user: config.ZOHO_MAIL_USER,
            accessToken,
        },
        // On 587 the access token is sent after STARTTLS. Without this,
        // nodemailer would continue in cleartext against a server that does not
        // advertise STARTTLS — handing the bearer token to anyone on the path.
        requireTLS: port !== 465,
    });

    cachedZohoTransport = { accessToken, transport };
    return transport;
}

async function getTransport() {
    if (zohoOAuth.isEnabled()) return getZohoTransport();

    if (cachedTransport !== undefined) return cachedTransport;

    if (!config.SMTP_HOST) {
        if (config.NODE_ENV === 'production') {
            throw new Error(
                'SMTP_HOST is not configured. Password reset email cannot be delivered in production.'
            );
        }
        cachedTransport = null; // dev: log-only mode
        return cachedTransport;
    }

    cachedTransport = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        // 465 is implicit TLS; 587 upgrades via STARTTLS.
        secure: config.SMTP_PORT === 465,
        auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } : undefined,
        requireTLS: config.SMTP_PORT !== 465,
    });

    return cachedTransport;
}

async function sendMail({ to, subject, text, html }) {
    const transport = await getTransport();

    if (!transport) {
        console.log(
            [
                '',
                '──────────── DEV MAIL (no SMTP configured) ────────────',
                `To:      ${to}`,
                `Subject: ${subject}`,
                '',
                text,
                '───────────────────────────────────────────────────────',
                '',
            ].join('\n')
        );
        return { delivered: false, logged: true };
    }

    await transport.sendMail({ from: config.MAIL_FROM, to, subject, text, html });
    return { delivered: true, logged: false };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendPasswordResetEmail({ to, name, resetUrl, expiresInMinutes }) {
    const greeting = name ? `Hi ${name},` : 'Hi,';
    const safeUrl = escapeHtml(resetUrl);

    const text = [
        greeting,
        '',
        'We received a request to reset the password on your FIBI account.',
        '',
        'Open this link to choose a new password:',
        resetUrl,
        '',
        `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
        '',
        'If you did not request this, you can ignore this email — your password',
        'will not change and no action is required.',
        '',
        '— FIBI',
    ].join('\n');

    const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
      <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#047857;margin:0 0 8px;font-weight:600">FIBI</p>
      <h1 style="font-size:22px;margin:0 0 16px">Reset your password</h1>
      <p style="margin:0 0 12px;line-height:1.6;color:#334155">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 24px;line-height:1.6;color:#334155">
        We received a request to reset the password on your FIBI account.
      </p>
      <p style="margin:0 0 28px">
        <a href="${safeUrl}"
           style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-weight:600">
          Choose a new password
        </a>
      </p>
      <p style="margin:0 0 8px;line-height:1.6;color:#64748b;font-size:14px">
        This link expires in ${expiresInMinutes} minutes and can only be used once.
      </p>
      <p style="margin:0 0 24px;line-height:1.6;color:#64748b;font-size:14px">
        If you did not request this, ignore this email — your password will not change.
      </p>
      <p style="margin:0;color:#94a3b8;font-size:12px;word-break:break-all">
        Link not working? Paste this into your browser:<br>${safeUrl}
      </p>
    </div>`;

    return sendMail({ to, subject: 'Reset your FIBI password', text, html });
}

const TIER_NAMES = {
    free: 'Free',
    basic: 'Basic',
    premium: 'Premium',
    investor_plus: 'Investor+',
};

/**
 * Tell an applicant what an admin decided.
 *
 * Best-effort by design: the decision is already committed by the time this
 * runs, and a mail outage must not turn an approval into a 500. Callers do not
 * await it.
 */
async function sendMembershipDecisionEmail({ to, name, approved, tier, feedback, actionUrl }) {
    const greeting = name ? `Hi ${name},` : 'Hi,';
    const tierName = TIER_NAMES[tier] || tier || 'Member';

    const subject = approved
        ? 'Your FIBI membership application was approved'
        : 'An update on your FIBI membership application';

    const lead = approved
        ? `Your application has been approved at the ${tierName} tier. The last step is to activate your membership.`
        : 'After review, we are not moving forward with your application at this time.';

    const text = [
        greeting,
        '',
        lead,
        feedback ? `\nNote from the review team:\n${feedback}` : '',
        approved && actionUrl ? `\nActivate your membership:\n${actionUrl}` : '',
        approved
            ? ''
            : '\nYou are welcome to apply again — tell us more about how you want to take part in the community.',
        '',
        '— FIBI',
    ]
        .filter((line) => line !== '')
        .join('\n');

    const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
      <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#047857;margin:0 0 8px;font-weight:600">FIBI</p>
      <h1 style="font-size:22px;margin:0 0 16px">${approved ? 'Welcome to FIBI' : 'Application update'}</h1>
      <p style="margin:0 0 12px;line-height:1.6;color:#334155">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 20px;line-height:1.6;color:#334155">${escapeHtml(lead)}</p>
      ${
          feedback
              ? `<blockquote style="margin:0 0 20px;padding:12px 16px;background:#f8fafc;border-left:3px solid #cbd5e1;color:#475569;line-height:1.6">${escapeHtml(
                    feedback
                )}</blockquote>`
              : ''
      }
      ${
          approved && actionUrl
              ? `<p style="margin:0 0 24px">
                   <a href="${escapeHtml(actionUrl)}"
                      style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-weight:600">
                     Activate ${escapeHtml(tierName)} membership
                   </a>
                 </p>`
              : ''
      }
      <p style="margin:0;color:#94a3b8;font-size:12px">— FIBI</p>
    </div>`;

    return sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendPasswordResetEmail, sendMembershipDecisionEmail };
