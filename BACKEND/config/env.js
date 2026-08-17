require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV,
  /** Proxy hops in front of Express. 1 = the nginx edge proxy. See TRUST_PROXY in .env. */
  TRUST_PROXY: process.env.TRUST_PROXY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  /** If set, CORS allows only this origin. If unset, reflects requesting origin (fine for local Vite). */
  FRONTEND_URL: process.env.FRONTEND_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
  // Stripe payments for investor investments
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Outbound mail (password reset). With SMTP_HOST unset, development logs the
  // message instead of sending it; production refuses to start a reset it cannot
  // deliver. See services/mailer.service.js.
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  MAIL_FROM: process.env.MAIL_FROM || 'FIBI <no-reply@fibi.local>',

  // Zoho OAuth for outbound mail. When ZOHO_CLIENT_ID and ZOHO_MAIL_USER are
  // both set, the mailer authenticates with a short-lived OAuth access token
  // instead of SMTP_PASSWORD. See services/zohoOAuth.service.js.
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
  /** Data-centre specific. .com, .eu, .in, .com.au, .jp, .ca and .sa are separate realms — a token from one is invalid at another. */
  ZOHO_ACCOUNTS_DOMAIN: process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com',
  /**
   * Must match the Authorized Redirect URI registered in Zoho's API Console
   * character for character, trailing slash included, or Zoho answers
   * "invalid redirect_uri" before the user ever sees a consent screen.
   */
  ZOHO_REDIRECT_URI:
    process.env.ZOHO_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 5000}/api/v1/zoho/oauth/callback`,
  ZOHO_SCOPE: process.env.ZOHO_SCOPE || 'ZohoMail.messages.CREATE,ZohoMail.accounts.READ',
  /** Mail API host, paired with the accounts realm above (mail.zoho.eu, .in, …). */
  ZOHO_MAIL_API_DOMAIN: process.env.ZOHO_MAIL_API_DOMAIN || 'https://mail.zoho.com',
  /**
   * The mailbox that sends platform mail. Must be an address the Zoho account is
   * actually allowed to send from — check with GET /api/v1/zoho/status, which
   * lists them. A mailbox that merely exists in DNS is not enough.
   */
  ZOHO_MAIL_USER: process.env.ZOHO_MAIL_USER,
  /** Optional: skip the accounts lookup by pinning the Zoho account id. */
  ZOHO_ACCOUNT_ID: process.env.ZOHO_ACCOUNT_ID,
  /** Optional: inject a refresh token directly and skip the browser connect flow entirely. */
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN,
};