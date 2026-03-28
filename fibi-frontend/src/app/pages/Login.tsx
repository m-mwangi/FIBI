import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Users, ShieldCheck } from 'lucide-react';
import logo from '../../assets/fibi_logo.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'investor' | 'admin'>('investor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={logo} alt="FIBI Logo" className="mx-auto h-35 w-auto" />
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Welcome back! Log in to your account</p>
        </div>

        {/* Role Toggle */}
        <div className="flex border rounded-full overflow-hidden mb-6 shadow-sm">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition ${
              role === 'investor'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700'
            }`}
            onClick={() => setRole('investor')}
          >
            <Users className="h-4 w-4" /> Investor
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition ${
              role === 'admin'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700'
            }`}
            onClick={() => setRole('admin')}
          >
            <ShieldCheck className="h-4 w-4" /> Admin
          </button>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder={role === 'admin' ? 'admin@example.com' : 'you@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-2">
                {role === 'investor' ? (
                  <>
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">
                    Use your admin account (same login as investors; role must match).
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to home elevated */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-block bg-white shadow-md hover:shadow-lg px-6 py-2 rounded-full text-gray-700 font-medium transition-all duration-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}