import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ArrowRight, Check, CircleAlert, ShieldCheck, X } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordField, PasswordStrength } from '../components/auth/PasswordField';
import { validatePassword } from '@/lib/passwordPolicy';

type TokenState =
  | { status: 'checking' }
  | { status: 'valid'; email: string }
  | { status: 'invalid'; error: string };

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [tokenState, setTokenState] = useState<TokenState>({ status: 'checking' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { verifyResetToken, resetPassword } = useAuth();
  const navigate = useNavigate();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Validate the link before rendering a form the server would only reject —
  // an expired link should say so immediately, not after the user picks a password.
  //
  // Keyed on `token` alone, via a ref. AuthContext hands out fresh function
  // identities on every render, so depending on `verifyResetToken` directly
  // re-ran this right after a successful reset — re-checking a token the server
  // had just consumed, and flipping the success screen to "link no longer valid".
  const verifyRef = useRef(verifyResetToken);
  verifyRef.current = verifyResetToken;

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setTokenState({ status: 'invalid', error: 'This reset link is missing its token.' });
      return;
    }

    (async () => {
      const result = await verifyRef.current(token);
      if (cancelled) return;
      setTokenState(
        result.success
          ? { status: 'valid', email: result.email }
          : { status: 'invalid', error: result.error }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const policy = validatePassword(password, {
      email: tokenState.status === 'valid' ? tokenState.email : undefined,
    });
    if (!policy.ok) {
      setError(policy.error);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Checked before the token branches: once the password has actually been
  // changed, the token is spent by design, and "done" is the truth to show.
  if (done) {
    return (
      <AuthLayout
        eyebrow="All set"
        title="Password updated"
        subtitle="Your new password is active on your account."
      >
        <div className="space-y-6">
          <div className="flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="space-y-1.5 text-sm leading-relaxed text-emerald-900">
              <p className="font-semibold">You have been signed out everywhere.</p>
              <p className="text-emerald-800/80">
                Every existing session on every device was ended, so anyone using your old password
                no longer has access.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/login', { replace: true })}
            className="group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Sign in with new password
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (tokenState.status === 'checking') {
    return (
      <AuthLayout eyebrow="Account recovery" title="Checking your link" subtitle="One moment…">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
          Verifying reset link…
        </div>
      </AuthLayout>
    );
  }

  if (tokenState.status === 'invalid') {
    return (
      <AuthLayout
        eyebrow="Account recovery"
        title="Link no longer valid"
        subtitle="Reset links expire after 30 minutes and can only be used once."
      >
        <div className="space-y-6">
          <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-900">{tokenState.error}</p>
          </div>

          <Link to="/forgot-password" className="block">
            <Button className="group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
              Request a new link
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>

          <p className="text-center text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle={`Setting a new password for ${tokenState.email}.`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {error && (
          <Alert variant="destructive" className="rounded-xl border-rose-200 bg-rose-50 text-rose-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <PasswordField
          id="rp-pass"
          label="New password"
          value={password}
          onChange={setPassword}
          disabled={isLoading}
          autoComplete="new-password"
          hint={<PasswordStrength password={password} />}
        />

        <PasswordField
          id="rp-pass2"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={isLoading}
          autoComplete="new-password"
          hint={
            confirmPassword ? (
              <p
                className={`flex items-center gap-1.5 pt-1 text-xs font-medium ${
                  passwordsMatch ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            ) : null
          }
        />

        <Button
          type="submit"
          className="group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Updating password…
            </>
          ) : (
            <>
              Update password
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-slate-500">
          <Link
            to="/login"
            className="font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
