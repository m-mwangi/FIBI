/**
 * Outbound mail.
 *
 * Uses SMTP when SMTP_HOST is configured. With no SMTP configured — the normal
 * state on localhost — it falls back to writing the message to the server log so
 * the reset flow is fully exercisable in development without a mail provider.
 *
 * The log fallback refuses to run in production: silently "sending" password
 * resets to a logfile on a live product would strand every locked-out user.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

let cachedTransport;

function getTransport() {
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
    const transport = getTransport();

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

module.exports = { sendMail, sendPasswordResetEmail };
