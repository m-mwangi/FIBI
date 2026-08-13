/**
 * Password admissibility for a financial product.
 *
 * Length is the dominant factor, so the floor is 8 with a bonus path: anything
 * 12+ passes on length alone (a passphrase beats a mangled 8-char password),
 * while shorter passwords must mix character classes.
 */

// Credential-stuffing fodder. Short list on purpose: it catches the reflex
// choices without pretending to be a breach corpus.
const BANNED = new Set([
    'password', 'password1', 'password123', 'passw0rd', '12345678', '123456789',
    '1234567890', 'qwerty123', 'qwertyuiop', 'letmein', 'welcome1', 'admin123',
    'iloveyou', 'sunshine', 'princess', 'football', 'baseball', 'trustno1',
    'starwars', 'whatever', 'zaq12wsx', 'abc12345', 'monkey123', 'dragon123',
    'fibi1234', 'fibipassword', 'changeme', 'secret123', 'test1234',
]);

const MIN_LENGTH = 8;
const PASSPHRASE_LENGTH = 12;
// bcrypt silently truncates at 72 bytes; refusing longer input is honest
// rather than accepting a password whose tail is ignored.
const MAX_LENGTH = 72;

/**
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
function validatePassword(password, { email, name } = {}) {
    if (typeof password !== 'string' || password.length === 0) {
        return { ok: false, error: 'Password is required' };
    }
    if (password.length < MIN_LENGTH) {
        return { ok: false, error: `Password must be at least ${MIN_LENGTH} characters` };
    }
    if (Buffer.byteLength(password, 'utf8') > MAX_LENGTH) {
        return { ok: false, error: `Password must be at most ${MAX_LENGTH} characters` };
    }

    const lower = password.toLowerCase();

    if (BANNED.has(lower)) {
        return { ok: false, error: 'That password is too common. Choose something less predictable.' };
    }

    // A password containing the account's own identifiers is trivially guessable
    // by anyone who knows the user.
    const localPart = typeof email === 'string' ? email.split('@')[0].toLowerCase() : '';
    if (localPart.length >= 4 && lower.includes(localPart)) {
        return { ok: false, error: 'Password must not contain your email address' };
    }
    if (typeof name === 'string') {
        const firstName = name.trim().split(/\s+/)[0]?.toLowerCase() || '';
        if (firstName.length >= 4 && lower.includes(firstName)) {
            return { ok: false, error: 'Password must not contain your name' };
        }
    }

    // A single repeated character reaches any length while carrying no entropy.
    if (/^(.)\1+$/.test(password)) {
        return { ok: false, error: 'Password must not be a single repeated character' };
    }

    if (password.length >= PASSPHRASE_LENGTH) {
        return { ok: true };
    }

    const classes =
        (/[a-z]/.test(password) ? 1 : 0) +
        (/[A-Z]/.test(password) ? 1 : 0) +
        (/\d/.test(password) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

    if (classes < 3) {
        return {
            ok: false,
            error:
                `Passwords under ${PASSPHRASE_LENGTH} characters need at least three of: ` +
                'lowercase, uppercase, number, symbol.',
        };
    }

    return { ok: true };
}

module.exports = { validatePassword, MIN_LENGTH, MAX_LENGTH, PASSPHRASE_LENGTH };
