import { useState } from 'react';
import { Check, Circle, Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authInputClass, authLabelClass } from './AuthLayout';
import { MIN_LENGTH, PASSPHRASE_LENGTH, policyChecklist } from '@/lib/passwordPolicy';

export function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete = 'current-password',
  minLength,
  placeholder = '••••••••',
  hint,
  labelAccessory,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  minLength?: number;
  placeholder?: string;
  hint?: React.ReactNode;
  /** Rendered opposite the label — used for the "Forgot password?" link. */
  labelAccessory?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className={authLabelClass}>
          {label}
        </Label>
        {labelAccessory}
      </div>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={minLength}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`${authInputClass} pl-11 pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      {hint}
    </div>
  );
}

const LEVELS = [
  { label: 'Too weak', bar: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Weak', bar: 'bg-orange-500', text: 'text-orange-600' },
  { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Strong', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  { label: 'Excellent', bar: 'bg-emerald-600', text: 'text-emerald-700' },
];

/** Thresholds track the MIN_LENGTH/PASSPHRASE_LENGTH floors in lib/passwordPolicy. */
export function scorePassword(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= MIN_LENGTH) score += 1;
  if (pw.length >= PASSPHRASE_LENGTH) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = LEVELS[Math.max(0, score - 1)];
  const checklist = policyChecklist(password);

  return (
    <div className="pt-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? level.bar : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${level.text}`}>{level.label}</p>

      {/* The rules the server will enforce, shown while typing rather than as a
          round-trip rejection. */}
      <ul className="mt-2 space-y-1">
        {checklist.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-start gap-1.5 text-xs ${
              rule.met ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {rule.met ? (
              <Check className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            ) : (
              <Circle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
