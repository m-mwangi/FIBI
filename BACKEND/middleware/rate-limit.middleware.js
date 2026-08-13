/**
 * Rate limiters for abuse-prone endpoints.
 *
 * NOTE ON STORAGE: these use express-rate-limit's default in-memory store, which
 * is per-process. With a single API container that is correct. If the API is
 * ever scaled to multiple replicas, swap in a shared store (Redis / Postgres) or
 * each replica will independently grant the full quota.
 */

const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { normalizeEmail } = require('../utils/email-validation.util');

const jsonMessage = (error) => ({ success: false, error });

/** Shared options: standard RateLimit-* headers, no legacy X-RateLimit-*. */
const base = {
    standardHeaders: 'draft-7',
    legacyHeaders: false,
};

/**
 * Key on client IP + submitted email.
 *
 * IP alone lets one attacker on a NAT/proxy lock out an entire office, and email
 * alone lets an attacker deny service to a known victim by burning their quota.
 * Combining them means an attacker must control both axes to sustain guessing,
 * while a legitimate user retyping their own password is unaffected by others.
 *
 * `req.ip` must go through `ipKeyGenerator`, not be used raw. A single IPv6
 * customer is routinely handed a whole /64, so keying on the exact address lets
 * an attacker walk through addresses in their own prefix and get a fresh quota
 * every time — the limiter would look active while enforcing nothing. The helper
 * collapses IPv6 to its /56 subnet and passes IPv4 through unchanged.
 */
const ipAndEmailKey = (req) => {
    const email = normalizeEmail(req.body && req.body.email) || 'anonymous';
    return `${ipKeyGenerator(req.ip)}|${email}`;
};

/**
 * Login attempts. Deliberately does not count successful logins, so a person
 * signing in normally many times a day never trips it — only failures accumulate.
 */
const loginLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 8,
    keyGenerator: ipAndEmailKey,
    skipSuccessfulRequests: true,
    message: jsonMessage('Too many sign-in attempts. Wait 15 minutes and try again.'),
});

/** Broader per-IP ceiling so one host cannot spray attempts across many accounts. */
const loginIpLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 40,
    skipSuccessfulRequests: true,
    message: jsonMessage('Too many sign-in attempts from this network. Try again later.'),
});

/**
 * Registration is limited on two separate axes because the two failure modes
 * need very different budgets.
 *
 * Accounts actually created — the thing an abuser wants — is capped hard. A
 * rejected attempt is usually just a typo or a password that missed the policy,
 * so those get a much larger allowance; charging them against the same quota
 * would lock a fumbling but legitimate investor out of signing up for an hour.
 */
const registerLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 10,
    skipFailedRequests: true,
    message: jsonMessage('Too many accounts created from this network. Try again in an hour.'),
});

const registerAttemptLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 40,
    message: jsonMessage('Too many registration attempts. Try again in an hour.'),
});

/**
 * Password reset requests. Tight because each one sends an email — an unlimited
 * endpoint is both a mail-bomb vector aimed at a victim's inbox and a fast way
 * to burn a paid sending quota.
 */
const forgotPasswordLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 4,
    keyGenerator: ipAndEmailKey,
    message: jsonMessage('Too many reset requests. Wait an hour before trying again.'),
});

const forgotPasswordIpLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 15,
    message: jsonMessage('Too many reset requests from this network. Try again later.'),
});

/** Reset submission + token lookups: stops brute-forcing the token itself. */
const resetPasswordLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: jsonMessage('Too many attempts. Wait 15 minutes and try again.'),
});

/** OAuth exchange: the provider assertion still costs us a verification round trip. */
const oauthLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: jsonMessage('Too many sign-in attempts. Try again shortly.'),
});

/**
 * Whole-API ceiling. Generous enough that normal browsing never notices, low
 * enough to blunt scraping and slow-loris style hammering.
 */
const globalLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 300,
    message: jsonMessage('Too many requests. Slow down and try again shortly.'),
    // Health checks must never be throttled — Docker restarts the container if
    // the probe starts failing.
    skip: (req) => req.path === '/health',
});

module.exports = {
    loginLimiter,
    loginIpLimiter,
    registerLimiter,
    registerAttemptLimiter,
    forgotPasswordLimiter,
    forgotPasswordIpLimiter,
    resetPasswordLimiter,
    oauthLimiter,
    globalLimiter,
};
