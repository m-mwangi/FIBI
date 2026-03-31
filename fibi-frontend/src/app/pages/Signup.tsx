import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { AlertCircle, Leaf } from 'lucide-react';
import logo from '../../assets/fibi_logo.svg';
import { startOAuth, type OAuthProvider } from '@/lib/socialOAuth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup({
        name,
        email,
        password,
        dob: dob || undefined,
        country: country || undefined,
        idType,
        idNumber: idNumber || undefined,
      });
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: OAuthProvider) => {
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
      setError(err instanceof Error ? err.message : 'OAuth signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'h-10 rounded-xl border-slate-200';
  const selectClass =
    'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="relative min-h-screen py-10 sm:py-14 px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-teal-100/50" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <img src={logo} alt="FIBI" className="mx-auto h-10 sm:h-11 w-auto" />
          </Link>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Leaf className="h-4 w-4 text-emerald-600" />
            Investor registration
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-emerald-900/10 ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-xl text-slate-900">Create your account</CardTitle>
            <CardDescription>Join FIBI to browse and invest in vetted projects.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Profile</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input
                      id="su-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input
                      id="su-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Identity</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="su-dob">Date of birth</Label>
                    <Input
                      id="su-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-country">Country</Label>
                    <Input
                      id="su-country"
                      type="text"
                      placeholder="Kenya"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-idtype">ID type</Label>
                    <select
                      id="su-idtype"
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className={selectClass}
                      disabled={isLoading}
                    >
                      <option value="passport">Passport</option>
                      <option value="national-id">National ID</option>
                      <option value="drivers-license">Driver&apos;s license</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-idnum">ID number</Label>
                    <Input
                      id="su-idnum"
                      type="text"
                      placeholder="Document number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      required
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Security</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="su-pass">Password</Label>
                    <Input
                      id="su-pass"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pass2">Confirm password</Label>
                    <Input
                      id="su-pass2"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base font-semibold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account…' : 'Create account'}
              </Button>

              <div className="relative py-1">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-500">
                  or sign up with
                </span>
              </div>

              <div className="grid gap-2">
                <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isLoading} onClick={() => handleOAuthSignup('google')}>
                  Continue with Google
                </Button>
                <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isLoading} onClick={() => handleOAuthSignup('facebook')}>
                  Continue with Facebook
                </Button>
                <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isLoading} onClick={() => handleOAuthSignup('apple')}>
                  Continue with Apple
                </Button>
              </div>

              <p className="text-center text-sm text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-700">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
