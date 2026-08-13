/**
 * Mirror of BACKEND/utils/password-policy.util.js.
 *
 * The server is the authority — this exists so the user sees the rule as they
 * type instead of after a round trip. Keep the two in sync when either changes.
 */

export const MIN_LENGTH = 8;
export const PASSPHRASE_LENGTH = 12;
export const MAX_LENGTH = 72;

const BANNED = new Set([
  'password', 'password1', 'password123', 'passw0rd', '12345678', '123456789',
  '1234567890', 'qwerty123', 'qwertyuiop', 'letmein', 'welcome1', 'admin123',
  'iloveyou', 'sunshine', 'princess', 'football', 'baseball', 'trustno1',
  'starwars', 'whatever', 'zaq12wsx', 'abc12345', 'monkey123', 'dragon123',
  'fibi1234', 'fibipassword', 'changeme', 'secret123', 'test1234',
]);

export type PolicyResult = { ok: true } | { ok: false; error: string };

export function validatePassword(
  password: string,
  { email, name }: { email?: string; name?: string } = {}
): PolicyResult {
  if (!password) return { ok: false, error: 'Password is required' };
  if (password.length < MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (new Blob([password]).size > MAX_LENGTH) {
    return { ok: false, error: `Password must be at most ${MAX_LENGTH} characters` };
  }

  const lower = password.toLowerCase();

  if (BANNED.has(lower)) {
    return { ok: false, error: 'That password is too common. Choose something less predictable.' };
  }

  const localPart = email ? email.split('@')[0].toLowerCase() : '';
  if (localPart.length >= 4 && lower.includes(localPart)) {
    return { ok: false, error: 'Password must not contain your email address' };
  }
  const firstName = name ? name.trim().split(/\s+/)[0]?.toLowerCase() ?? '' : '';
  if (firstName.length >= 4 && lower.includes(firstName)) {
    return { ok: false, error: 'Password must not contain your name' };
  }
  if (/^(.)\1+$/.test(password)) {
    return { ok: false, error: 'Password must not be a single repeated character' };
  }

  if (password.length >= PASSPHRASE_LENGTH) return { ok: true };

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

/** The live checklist shown under the password field while typing. */
export function policyChecklist(password: string) {
  const classes =
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  return [
    { label: `At least ${MIN_LENGTH} characters`, met: password.length >= MIN_LENGTH },
    {
      label: `3 of lower/upper/number/symbol — or ${PASSPHRASE_LENGTH}+ characters`,
      met: password.length >= PASSPHRASE_LENGTH || classes >= 3,
    },
    // Only the banned-list check is possible here; the server additionally
    // rejects reuse of the current password, which the client cannot see.
    { label: 'Not a commonly used password', met: password.length > 0 && !BANNED.has(password.toLowerCase()) },
  ];
}
