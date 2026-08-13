import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight, MailCheck, Mail } from 'lucide-react';
import { AuthLayout, authInputClass, authLabelClass } from '../components/auth/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        // Confirmation is deliberately non-committal: the API cannot tell us
        // whether the address is registered, and surfacing that would leak the
        // investor list to anyone with a list of emails to test.
        setSent(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        eyebrow="Check your inbox"
        title="Reset link sent"
        subtitle="If an account exists for that address, the link is on its way."
      >
        <div className="space-y-6">
          <div className="flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-5">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="space-y-2 text-sm leading-relaxed text-emerald-900">
              <p>
                We sent instructions to <strong className="font-semibold">{email}</strong> if it
                matches a FIBI account.
              </p>
              <p className="text-emerald-800/80">
                The link expires in 30 minutes and can only be used once. Check your spam folder if
                it does not arrive within a few minutes.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSent(false);
              setError('');
            }}
            className="h-12 w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Use a different email
          </Button>

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
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send you a link to choose a new password."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="rounded-xl border-rose-200 bg-rose-50 text-rose-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="fp-email" className={authLabelClass}>
            Email address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              id="fp-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              className={`${authInputClass} pl-11`}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <p className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
