import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CreditCard, Lock, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Store, User } from 'lucide-react';
import { getJson, putJson } from '@/lib/api';
import { USERS_PREFIX } from '@/lib/users';
import { validatePassword } from '@/lib/passwordPolicy';
import { useAuth } from '../../context/AuthContext';
import { SETTINGS_API, type GlobalSettingsDTO } from '../lib/types';
import { Flash, PageHeader, Panel } from '../components/primitives';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

/** Editable subset of the settings DTO (everything except the server-owned id). */
type SettingsForm = Omit<GlobalSettingsDTO, 'id'>;

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-400">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          checked ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        {/* `left-0.5` is required: without an explicit inset the knob resolves to
            its static position (22px in) and the transform adds to that, throwing
            the knob clean outside the track in the checked state. */}
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClass = 'h-11 rounded-xl border-slate-200 bg-white';

export default function Settings() {
  const { user, refreshUser } = useAuth();

  const [saved, setSaved] = useState<SettingsForm | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwFlash, setPwFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson<{ settings: GlobalSettingsDTO }>(SETTINGS_API);
    setLoading(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error || 'Failed to load settings.' });
      return;
    }
    const { id: _id, ...rest } = res.data.settings;
    setSaved(rest);
    setForm(rest);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (user) setProfileName(user.name);
  }, [user]);

  /**
   * One dirty flag for the whole page.
   *
   * The old settings screen had six independent Save buttons over six slices of
   * the same record, so it was easy to change three panels and persist one.
   * Here every field feeds one payload and one save.
   */
  const dirty = useMemo(
    () => !!form && !!saved && JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved]
  );

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!form) return;
    setFlash(null);

    if (!form.platformName.trim()) {
      setFlash({ type: 'err', text: 'Platform name is required.' });
      return;
    }
    if (form.maxInvestment > 0 && form.minInvestment > form.maxInvestment) {
      setFlash({ type: 'err', text: 'Minimum investment cannot exceed the maximum.' });
      return;
    }

    setSaving(true);
    const res = await putJson<{ settings: GlobalSettingsDTO }>(SETTINGS_API, {
      ...form,
      platformName: form.platformName.trim(),
      supportEmail: form.supportEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      currency: form.currency.trim() || 'USD',
    });
    setSaving(false);

    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    const { id: _id, ...rest } = res.data.settings;
    setSaved(rest);
    setForm(rest);
    setFlash({ type: 'ok', text: 'Settings saved.' });
  };

  const handleProfileSave = async () => {
    setProfileBusy(true);
    setFlash(null);
    const res = await putJson(`${USERS_PREFIX}/profile`, { name: profileName.trim() });
    setProfileBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: 'Profile updated.' });
    await refreshUser();
  };

  const handlePasswordChange = async () => {
    setPwFlash(null);

    // Same policy the server enforces, surfaced before the round trip.
    const policy = validatePassword(pwNew, { email: user?.email, name: user?.name });
    if (!policy.ok) {
      setPwFlash({ type: 'err', text: policy.error });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwFlash({ type: 'err', text: 'New passwords do not match.' });
      return;
    }

    setPwBusy(true);
    const res = await putJson(`${USERS_PREFIX}/change-password`, {
      currentPassword: pwCurrent,
      newPassword: pwNew,
    });
    setPwBusy(false);
    if (!res.ok) {
      setPwFlash({ type: 'err', text: res.error });
      return;
    }
    setPwFlash({ type: 'ok', text: 'Password updated.' });
    setPwCurrent('');
    setPwNew('');
    setPwConfirm('');
  };

  if (loading || !form) {
    return (
      <>
        <PageHeader title="Settings" description="Platform configuration and your admin account." />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform configuration and your admin account."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200"
              disabled={!dirty || saving}
              onClick={() => saved && setForm(saved)}
            >
              <RotateCcw className="h-4 w-4" /> Discard
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={!dirty || saving}
              onClick={() => void handleSave()}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      {dirty && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You have unsaved changes.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Platform" description="Public identity and support contacts">
          <div className="space-y-4">
            <Field id="s-name" label="Platform name">
              <Input
                id="s-name"
                value={form.platformName}
                onChange={(e) => set('platformName', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="s-email" label="Support email">
              <Input
                id="s-email"
                type="email"
                value={form.supportEmail}
                onChange={(e) => set('supportEmail', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="s-phone" label="Contact phone">
              <Input
                id="s-phone"
                value={form.contactPhone}
                onChange={(e) => set('contactPhone', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Investment rules" description="Limits applied to every project">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="s-min" label="Minimum investment">
              <Input
                id="s-min"
                type="number"
                value={form.minInvestment}
                onChange={(e) => set('minInvestment', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field id="s-max" label="Maximum investment">
              <Input
                id="s-max"
                type="number"
                value={form.maxInvestment}
                onChange={(e) => set('maxInvestment', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field id="s-fee" label="Platform fee (%)">
              <Input
                id="s-fee"
                type="number"
                step="0.1"
                value={form.platformFee}
                onChange={(e) => set('platformFee', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field id="s-currency" label="Currency">
              <Input
                id="s-currency"
                value={form.currency}
                onChange={(e) => set('currency', e.target.value.toUpperCase())}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Payments" description="Control money movement platform-wide">
          <div className="divide-y divide-slate-100">
            <Toggle
              label="Enable deposits"
              description="Investors can add funds"
              checked={form.depositsEnabled}
              onChange={(v) => set('depositsEnabled', v)}
            />
            <Toggle
              label="Enable withdrawals"
              description="Investors can cash out"
              checked={form.withdrawalsEnabled}
              onChange={(v) => set('withdrawalsEnabled', v)}
            />
            <div className="pt-4">
              <Field id="s-txfee" label="Transaction fee (%)">
                <Input
                  id="s-txfee"
                  type="number"
                  step="0.1"
                  value={form.transactionFee}
                  onChange={(e) => set('transactionFee', Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Notifications" description="Which emails the platform sends">
          <div className="divide-y divide-slate-100">
            <Toggle
              label="Email notifications"
              description="Master switch for all outbound email"
              checked={form.emailNotifications}
              onChange={(v) => set('emailNotifications', v)}
            />
            <Toggle
              label="Investment confirmations"
              description="Receipt after each investment"
              checked={form.investmentEmails}
              onChange={(v) => set('investmentEmails', v)}
            />
            <Toggle
              label="Admin alerts"
              description="Notify admins of platform events"
              checked={form.adminAlerts}
              onChange={(v) => set('adminAlerts', v)}
            />
          </div>
        </Panel>

        <Panel title="Security" description="Session and authentication policy">
          <div className="divide-y divide-slate-100">
            <Toggle
              label="Two-factor authentication"
              description="Require a second factor for admin sign-in"
              checked={form.twoFactorAuth}
              onChange={(v) => set('twoFactorAuth', v)}
            />
            <div className="pt-4">
              <Field
                id="s-timeout"
                label="Session timeout (minutes)"
                hint="How long an idle admin session stays valid."
              >
                <Input
                  id="s-timeout"
                  type="number"
                  value={form.sessionTimeout}
                  onChange={(e) => set('sessionTimeout', Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Your account" description="Your own admin profile and password">
          <div className="space-y-5">
            <Field id="s-profile-name" label="Display name">
              <Input
                id="s-profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="s-profile-email" label="Email" hint="Your login address cannot be changed here.">
              <Input id="s-profile-email" value={user?.email ?? ''} disabled className={`${inputClass} bg-slate-50`} />
            </Field>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200"
              disabled={profileBusy || !profileName.trim() || profileName.trim() === user?.name}
              onClick={() => void handleProfileSave()}
            >
              <User className="h-4 w-4" />
              {profileBusy ? 'Saving…' : 'Update profile'}
            </Button>

            <hr className="border-slate-100" />

            {pwFlash && (
              <p
                className={`rounded-xl border px-4 py-3 text-sm ${
                  pwFlash.type === 'ok'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                {pwFlash.text}
              </p>
            )}

            <Field id="s-pw-current" label="Current password">
              <Input
                id="s-pw-current"
                type="password"
                autoComplete="current-password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="s-pw-new" label="New password">
              <Input
                id="s-pw-new"
                type="password"
                autoComplete="new-password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="s-pw-confirm" label="Confirm new password">
              <Input
                id="s-pw-confirm"
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200"
              disabled={pwBusy || !pwCurrent || !pwNew}
              onClick={() => void handlePasswordChange()}
            >
              <Lock className="h-4 w-4" />
              {pwBusy ? 'Updating…' : 'Change password'}
            </Button>
          </div>
        </Panel>
      </div>

      {/* Legend for the icons used above, kept out of the way. */}
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" /> Platform</span>
        <span className="inline-flex items-center gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5" /> Investment rules</span>
        <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payments</span>
        <span className="inline-flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Security</span>
      </div>
    </>
  );
}
