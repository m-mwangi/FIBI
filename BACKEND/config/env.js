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
};