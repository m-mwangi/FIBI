import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { AuthLayout, authInputClass, authLabelClass } from '../components/auth/AuthLayout';
import { PasswordField } from '../components/auth/PasswordField';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { startOAuth, type OAuthProvider } from '@/lib/socialOAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  /**
   * Route on the role the server returned for this account — the user never
   * declares it. `from` is only honoured when it belongs to the role we actually
   * got back, so a deep link into /admin cannot carry an investor there.
   */
  const destinationFor = (role: 'investor' | 'admin') => {
    const defaultPath = role === 'admin' ? '/admin' : '/dashboard';
    const canUseFrom =
      fromPath &&
      ((role === 'admin' && fromPath.startsWith('/admin')) ||
        (role === 'investor' &&
          (fromPath.startsWith('/dashboard') ||
            fromPath.startsWith('/membership') ||
            fromPath.startsWith('/member-hub'))));
    return canUseFrom ? fromPath : defaultPath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(destinationFor(result.user.role), { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setError('');
    setIsLoading(true);
    try {
      const payload = await startOAuth(provider);
      const result = await oauthLogin(provider, payload);
      if (result.success) {
        navigate(destinationFor(result.user.role), { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to FIBI"
      subtitle="Track your portfolio, review funding progress, and back new projects."
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-rose-200 bg-rose-50 text-rose-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-email" className={authLabelClass}>
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className={`${authInputClass} pl-11`}
              />
            </div>
          </div>

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            disabled={isLoading}
            autoComplete="current-password"
            labelAccessory={
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
              >
                Forgot password?
              </Link>
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
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        <SocialAuthButtons label="or continue with" onSelect={handleOAuthLogin} disabled={isLoading} />

        <p className="text-center text-sm text-slate-500">
          New to FIBI?{' '}
          <Link
            to="/signup"
            className="font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
