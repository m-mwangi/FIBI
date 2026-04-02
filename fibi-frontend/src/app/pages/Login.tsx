import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { AlertCircle, Users, ShieldCheck, Leaf, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/fibi_logo.svg';
import { startOAuth, type OAuthProvider } from '@/lib/socialOAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'investor' | 'admin'>('investor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password, role);
      if (result.success) {
        const defaultPath = result.user.role === 'admin' ? '/admin' : '/dashboard';
        const canUseFrom =
          fromPath &&
          ((result.user.role === 'admin' && fromPath.startsWith('/admin')) ||
            (result.user.role === 'investor' && fromPath.startsWith('/dashboard')));
        navigate(canUseFrom ? fromPath : defaultPath, { replace: true });
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
        navigate('/dashboard', { replace: true });
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/80 via-white to-teal-100/60" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={logo} alt="FIBI" className="mx-auto h-50 sm:h-51 w-auto" />
          </Link>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Leaf className="h-4 w-4 text-emerald-600" />
            Welcome back
          </p>
        </div>

        <div className="mb-6 flex rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              role === 'investor' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setRole('investor')}
          >
            <Users className="h-4 w-4" /> Investor
          </button>
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              role === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setRole('admin')}
          >
            <ShieldCheck className="h-4 w-4" /> Admin
          </button>
        </div>

        <Card className="border-0 shadow-2xl shadow-emerald-900/10 ring-1 ring-slate-100/80 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={role === 'admin' ? 'admin@example.com' : 'you@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-slate-200 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base font-semibold shadow-md shadow-emerald-900/15"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </Button>

              {role === 'investor' && (
                <>
                  <div className="relative py-1">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-500">
                      or continue with
                    </span>
                  </div>

                  <div className="grid gap-2">
                    <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isLoading} onClick={() => handleOAuthLogin('google')}>
                      Continue with Google
                    </Button>
                    <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isLoading} onClick={() => handleOAuthLogin('facebook')}>
                      Continue with Facebook
                    </Button>
                    <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isLoading} onClick={() => handleOAuthLogin('apple')}>
                      Continue with Apple
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center text-sm text-slate-600 pt-1">
                {role === 'investor' ? (
                  <>
                    New to FIBI?{' '}
                    <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                      Create account
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">
                    Admin login must match the <strong className="text-slate-700">Admin</strong> role selected above.
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
