import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { getJson, putJson, MEMBERSHIP_PREFIX } from '@/lib/api';
import { MEMBERSHIP_TIER_ORDER, tierLabel } from '@/lib/membership';
import { majorToMinor, minorToMajor } from '@/lib/money';
import type { MembershipPlanRow } from '../../lib/types';
import { EmptyState, Flash, Panel } from '../../components/primitives';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';

/**
 * Plan editor.
 *
 * The plans table already existed and was already writable through the API, but
 * nothing in the console could reach it — prices could only be changed by
 * editing the database or the frontend's hardcoded copy. This is the missing
 * surface.
 */

type Draft = {
  name: string;
  /** Major units as typed, converted on save. */
  price: string;
  currency: string;
  description: string;
  active: boolean;
};

function toDraft(plan: MembershipPlanRow): Draft {
  return {
    name: plan.name,
    price: String(minorToMajor(plan.monthlyPriceMinor, plan.currency)),
    currency: plan.currency,
    description: plan.description,
    active: plan.active,
  };
}

export function PlansPanel({ onSaved }: { onSaved?: () => void }) {
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingTier, setSavingTier] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson<{ success: boolean; plans: MembershipPlanRow[] }>(
      `${MEMBERSHIP_PREFIX}/admin/plans`
    );
    setLoading(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    const rows = res.data.plans ?? [];
    setPlans(rows);
    setDrafts(Object.fromEntries(rows.map((p) => [p.tier, toDraft(p)])));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = (plan: MembershipPlanRow) => {
    const d = drafts[plan.tier];
    if (!d) return false;
    return (
      d.name !== plan.name ||
      majorToMinor(d.price, d.currency) !== plan.monthlyPriceMinor ||
      d.currency !== plan.currency ||
      d.description !== plan.description ||
      d.active !== plan.active
    );
  };

  const save = async (plan: MembershipPlanRow) => {
    const d = drafts[plan.tier];
    if (!d) return;
    setSavingTier(plan.tier);
    setFlash(null);
    const res = await putJson<{ success: boolean }>(`${MEMBERSHIP_PREFIX}/admin/plans`, {
      tier: plan.tier,
      name: d.name,
      // Money crosses the wire as integer minor units; the operator types major.
      monthlyPriceMinor: majorToMinor(d.price, d.currency),
      currency: d.currency,
      description: d.description,
      active: d.active,
    });
    setSavingTier(null);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: `${d.name} plan saved.` });
    await load();
    onSaved?.();
  };

  const patch = (tier: string, next: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [tier]: { ...prev[tier]!, ...next } }));

  return (
    <Panel
      title="Plans and pricing"
      description="What members are charged. Changes take effect on the public pricing page immediately."
    >
      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState title="No plans" body="Membership plans will appear here once seeded." />
      ) : (
        <div className="space-y-3">
          {MEMBERSHIP_TIER_ORDER.map((tier) => {
            const plan = plans.find((p) => p.tier === tier);
            if (!plan) return null;
            const d = drafts[tier];
            if (!d) return null;
            const isDirty = dirty(plan);

            return (
              <div
                key={tier}
                className={`rounded-xl border p-4 transition-colors ${
                  d.active ? 'border-[var(--adm-line)]' : 'border-dashed border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {tierLabel(tier)}
                  </span>
                  <Input
                    value={d.name}
                    onChange={(e) => patch(tier, { name: e.target.value })}
                    className="h-9 w-44 rounded-lg"
                    placeholder="Plan name"
                  />
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={d.currency}
                      onChange={(e) => patch(tier, { currency: e.target.value.toUpperCase() })}
                      className="h-9 w-20 rounded-lg uppercase"
                      maxLength={3}
                    />
                    <Input
                      value={d.price}
                      onChange={(e) => patch(tier, { price: e.target.value })}
                      inputMode="decimal"
                      className="h-9 w-28 rounded-lg text-right"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>

                  <label className="ml-auto flex items-center gap-2 text-xs text-slate-600">
                    <Switch
                      checked={d.active}
                      onCheckedChange={(checked) => patch(tier, { active: checked })}
                    />
                    {d.active ? 'Listed' : 'Hidden'}
                  </label>

                  <Button
                    size="sm"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    disabled={!isDirty || savingTier !== null}
                    onClick={() => void save(plan)}
                  >
                    {savingTier === tier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isDirty ? 'Save' : 'Saved'}
                  </Button>
                </div>

                <Input
                  value={d.description}
                  onChange={(e) => patch(tier, { description: e.target.value })}
                  className="mt-3 h-9 rounded-lg"
                  placeholder="Short description shown on the pricing card"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Feature list: {plan.features.length > 0 ? plan.features.join(', ') : '—'} · edit
                  what each tier actually unlocks in the feature access matrix below.
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
