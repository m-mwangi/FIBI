/**
 * Email admissibility checks for account creation.
 *
 * Policy is *deliverability-based*: an address is accepted when its domain can
 * actually receive mail and is not a throwaway provider. That admits real
 * company domains and genuine free-provider mailboxes while rejecting the
 * placeholder and disposable addresses that pad a live product with unreachable
 * accounts (and give abusers unlimited free identities).
 *
 * Deliberately NOT an allow-list of known providers: an investor on their own
 * company domain is a legitimate signup and must not need manual whitelisting.
 */

const dns = require('dns').promises;

// RFC 5321 §4.5.3.1 — 64 octets local part, 254 total for the forward path.
const MAX_LOCAL = 64;
const MAX_TOTAL = 254;

// Intentionally stricter than RFC 5322: no quoted strings, no comments, no
// consecutive/leading/trailing dots. Those forms are legal but effectively never
// used by real signups, and every parser downstream disagrees about them.
const SYNTAX = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

// RFC 2606 + RFC 6761: reserved for documentation/testing, can never receive
// mail. This is what rejects the example.com-style addresses.
const RESERVED_DOMAINS = new Set([
    'example.com', 'example.net', 'example.org', 'example.edu',
    'test.com', 'localhost', 'invalid', 'local',
]);

const RESERVED_TLDS = new Set([
    'test', 'example', 'invalid', 'localhost', 'local', 'internal', 'onion', 'alt',
]);

// Throwaway inbox providers. Not exhaustive by nature — it is a cost-raiser, and
// the MX check below is what carries the real weight.
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
    'sharklasers.com', 'grr.la', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
    '10minutemail.com', '10minutemail.net', '20minutemail.com', 'tempmail.com',
    'temp-mail.org', 'temp-mail.io', 'tempmailo.com', 'tempr.email', 'tmpmail.org',
    'throwawaymail.com', 'trashmail.com', 'trashmail.de', 'trash-mail.com',
    'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'mailnesia.com',
    'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.org',
    'mytemp.email', 'fakeinbox.com', 'fakemailgenerator.com', 'emailondeck.com',
    'mohmal.com', 'moakt.com', 'tempinbox.com', 'burnermail.io', 'mailcatch.com',
    'inboxbear.com', 'spambog.com', 'mailexpire.com', 'anonbox.net',
    'discard.email', 'mailde.de', 'spamgourmet.com', 'incognitomail.com',
    'harakirimail.com', 'mintemail.com', 'tempmailaddress.com', 'email-fake.com',
    'luxusmail.org', 'vomoto.com', 'crazymailing.com', 'nowmymail.com',
]);

/**
 * Cache of domain -> { ok, at }. A DNS round trip on every signup attempt is
 * both slow and an easy amplification vector, and MX records change rarely.
 */
const mxCache = new Map();
const MX_CACHE_TTL_MS = 60 * 60 * 1000;
const MX_CACHE_MAX = 5000;
const MX_TIMEOUT_MS = 4000;

function cacheGet(domain) {
    const hit = mxCache.get(domain);
    if (!hit) return undefined;
    if (Date.now() - hit.at > MX_CACHE_TTL_MS) {
        mxCache.delete(domain);
        return undefined;
    }
    return hit.ok;
}

function cacheSet(domain, ok) {
    // Cheap bound: drop the oldest insertion when full. Map preserves insertion order.
    if (mxCache.size >= MX_CACHE_MAX) {
        const oldest = mxCache.keys().next().value;
        if (oldest !== undefined) mxCache.delete(oldest);
    }
    mxCache.set(domain, { ok, at: Date.now() });
}

/** Lowercase + trim. Does not strip dots or +tags — those are the user's address to keep. */
function normalizeEmail(raw) {
    return String(raw || '').trim().toLowerCase();
}

function syntaxProblem(email) {
    if (!email) return 'Email is required';
    if (email.length > MAX_TOTAL) return 'Email address is too long';
    const at = email.lastIndexOf('@');
    if (at === -1) return 'Enter a valid email address';
    if (email.slice(0, at).length > MAX_LOCAL) return 'Email address is too long';
    if (!SYNTAX.test(email)) return 'Enter a valid email address';
    return null;
}

function domainProblem(domain) {
    const tld = domain.slice(domain.lastIndexOf('.') + 1);

    if (RESERVED_DOMAINS.has(domain) || RESERVED_TLDS.has(tld)) {
        return 'That domain is reserved for testing and cannot receive mail. Use a real email address.';
    }
    if (DISPOSABLE_DOMAINS.has(domain)) {
        return 'Disposable email addresses are not accepted. Use a permanent address.';
    }
    // A registrable domain needs at least one dot; `user@localhost` and bare
    // hostnames are not reachable from the public internet.
    if (!domain.includes('.')) {
        return 'Enter a valid email address';
    }
    return null;
}

/**
 * True when the domain publishes usable mail routing.
 *
 * Fails CLOSED on an authoritative "this domain has no mail" answer (NXDOMAIN /
 * empty MX / no A fallback) and OPEN on resolver timeouts or outages — a flaky
 * DNS server must not take registration offline for everyone.
 */
async function hasMailExchanger(domain) {
    const cached = cacheGet(domain);
    if (cached !== undefined) return cached;

    const withTimeout = (p) =>
        Promise.race([
            p,
            new Promise((_, reject) =>
                setTimeout(() => reject(Object.assign(new Error('DNS timeout'), { code: 'ETIMEOUT' })), MX_TIMEOUT_MS)
            ),
        ]);

    try {
        const records = await withTimeout(dns.resolveMx(domain));
        if (Array.isArray(records) && records.some((r) => r && r.exchange)) {
            cacheSet(domain, true);
            return true;
        }
        // RFC 5321 §5.1: with no MX, the A/AAAA record is an implicit mail route.
        try {
            const addrs = await withTimeout(dns.resolve4(domain));
            const ok = Array.isArray(addrs) && addrs.length > 0;
            cacheSet(domain, ok);
            return ok;
        } catch {
            cacheSet(domain, false);
            return false;
        }
    } catch (err) {
        const code = err && err.code;
        if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NXDOMAIN') {
            // Authoritative: the domain does not exist or publishes no mail route.
            cacheSet(domain, false);
            return false;
        }
        // Resolver trouble (ETIMEOUT, ESERVFAIL, EREFUSED, offline). Not cached,
        // so the next attempt re-checks rather than locking the domain out.
        return true;
    }
}

/**
 * @returns {Promise<{ ok: true, email: string } | { ok: false, error: string }>}
 */
async function validateEmailForSignup(rawEmail, { checkMx = true } = {}) {
    const email = normalizeEmail(rawEmail);

    const syntax = syntaxProblem(email);
    if (syntax) return { ok: false, error: syntax };

    const domain = email.slice(email.lastIndexOf('@') + 1);

    const domainIssue = domainProblem(domain);
    if (domainIssue) return { ok: false, error: domainIssue };

    if (checkMx && !(await hasMailExchanger(domain))) {
        return {
            ok: false,
            error: 'That email domain cannot receive mail. Check the spelling of the address.',
        };
    }

    return { ok: true, email };
}

/** Cheap syntax-only gate for endpoints that merely look an address up (login, forgot-password). */
function isPlausibleEmail(rawEmail) {
    const email = normalizeEmail(rawEmail);
    return syntaxProblem(email) === null;
}

module.exports = {
    validateEmailForSignup,
    isPlausibleEmail,
    normalizeEmail,
    // exported for tests
    hasMailExchanger,
    DISPOSABLE_DOMAINS,
};
