import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Globe2,
  Mail,
  User,
  X,
} from 'lucide-react';
import { AuthLayout, authInputClass, authLabelClass } from '../components/auth/AuthLayout';
import { PasswordField, PasswordStrength } from '../components/auth/PasswordField';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { startOAuth, type OAuthProvider } from '@/lib/socialOAuth';
import { MIN_LENGTH, validatePassword } from '@/lib/passwordPolicy';

const STEPS = [
  { id: 0, label: 'Account' },
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Security' },
];

const COUNTRY_SUGGESTIONS = [
  'Kenya',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Nigeria',
  'Ghana',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'United Arab Emirates',
];

const ID_TYPES = [
  { value: 'national-id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers-license', label: "Driver's license" },
];

export default function Signup() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [idType, setIdType] = useState('national-id');
  const [idNumber, setIdNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const validateStep = (target: number): string => {
    if (target >= 1) {
      if (!name.trim()) return 'Please enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    }
    if (target >= 2) {
      if (!dob) return 'Please enter your date of birth.';
      const age = (Date.now() - new Date(dob).getTime()) / 31557600000;
      if (age < 18) return 'You must be at least 18 years old to invest.';
      if (!country.trim()) return 'Please enter your country of residence.';
      if (!idNumber.trim()) return 'Please enter your ID document number.';
    }
    return '';
  };

  const goNext = () => {
    const message = validateStep(step + 1);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < STEPS.length - 1) {
      goNext();
      return;
    }

    setError('');

    // Same rules the server enforces (lib/passwordPolicy mirrors the backend),
    // so a rejection surfaces here instead of as a round-trip error.
    const policy = validatePassword(password, { email, name });
    if (!policy.ok) {
      setError(policy.error);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the terms to continue.');
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

  return (
    <AuthLayout
      wide
      eyebrow="Create account"
      title="Join FIBI"
      subtitle="Three quick steps and you can start backing vetted land projects."
    >
      <div className="space-y-7">
        {/* Stepper */}
        <ol className="flex items-center">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : active
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'border border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.id + 1}
                  </span>
                  <span
                    className={`hidden text-sm font-medium sm:block ${
                      active ? 'text-slate-900' : done ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={`mx-3 h-px flex-1 transition-colors ${
                      done ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* noValidate: every field is validated per-step below, so native browser
            tooltips never pre-empt the styled inline errors. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-rose-200 bg-rose-50 text-rose-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ---------- Step 1: Account ---------- */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="su-name" className={authLabelClass}>
                  Full name
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <Input
                    id="su-name"
                    type="text"
                    placeholder="Jane Wanjiku"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    autoComplete="name"
                    className={`${authInputClass} pl-11`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-email" className={authLabelClass}>
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <Input
                    id="su-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className={`${authInputClass} pl-11`}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  We use this for project updates and distribution notices.
                </p>
              </div>
            </div>
          )}

          {/* ---------- Step 2: Identity ---------- */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs leading-relaxed text-emerald-800">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Land ownership is regulated — we verify identity before any investment is finalised.
                Your documents are stored securely.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="su-dob" className={authLabelClass}>
                    Date of birth
                  </Label>
                  <Input
                    id="su-dob"
                    type="date"
                    value={dob}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={isLoading}
                    className={authInputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="su-country" className={authLabelClass}>
                    Country of residence
                  </Label>
                  <div className="relative">
                    <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                    <Input
                      id="su-country"
                      type="text"
                      list="su-country-options"
                      placeholder="Kenya"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={isLoading}
                      autoComplete="country-name"
                      className={`${authInputClass} pl-11`}
                    />
                    <datalist id="su-country-options">
                      {COUNTRY_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={authLabelClass}>ID document type</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ID_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setIdType(t.value)}
                      disabled={isLoading}
                      aria-pressed={idType === t.value}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        idType === t.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-idnum" className={authLabelClass}>
                  Document number
                </Label>
                <Input
                  id="su-idnum"
                  type="text"
                  placeholder="e.g. 12345678"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  disabled={isLoading}
                  className={authInputClass}
                />
              </div>
            </div>
          )}

          {/* ---------- Step 3: Security ---------- */}
          {step === 2 && (
            <div className="space-y-5">
              <PasswordField
                id="su-pass"
                label="Password"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
                autoComplete="new-password"
                minLength={MIN_LENGTH}
                hint={<PasswordStrength password={password} />}
              />

              <PasswordField
                id="su-pass2"
                label="Confirm password"
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

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 transition-colors hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-600"
                />
                <span className="text-sm leading-relaxed text-slate-600">
                  I confirm the details above are accurate and I accept FIBI&apos;s investor terms and
                  risk disclosure.
                </span>
              </label>
            </div>
          )}

          {/* ---------- Navigation ---------- */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="group h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account…
                </>
              ) : (
                <>
                  {step === STEPS.length - 1 ? 'Create account' : 'Continue'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {step === 0 && (
          <SocialAuthButtons label="or sign up with" onSelect={handleOAuthSignup} disabled={isLoading} />
        )}

        <p className="text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
