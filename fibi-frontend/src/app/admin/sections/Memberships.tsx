import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  Clock,
  Lock,
  Sparkles,
  TriangleAlert,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { getJson, patchJson, putJson, MEMBERSHIP_PREFIX } from '@/lib/api';
import { MEMBERSHIP_TIER_ORDER, type MembershipTier } from '@/lib/membership';
import { useMembership } from '../../context/MembershipContext';
import { useAdminData } from '../lib/AdminDataContext';
import { useTableState } from '../lib/useTableState';
import { DataTable, type Column } from '../components/DataTable';
import {
  Avatar,
  EmptyState,
  Flash,
  PageHeader,
  Panel,
  StatCard,
  StatusPill,
} from '../components/primitives';
import { CHART_COLORS, formatDate, formatRelative } from '../lib/format';
import type { FeatureRow, MembershipApplicationRow, MembershipRow } from '../lib/types';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const TIER_LABEL: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium',
  investor_plus: 'Investor Plus',
};

export default function Memberships() {
  const { refreshMembership } = useMembership();
  const { applications: sharedApplications, refreshApplications, refreshAudit } = useAdminData();
  const [state, set] = useTableState();

  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [applications, setApplications] = useState<MembershipApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [featuresDirty, setFeaturesDirty] = useState(false);
  const [approveTier, setApproveTier] = useState<Record<string, MembershipTier>>({});

  const tierFilter = state.filter;

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    const [appsRes, memRes, featRes] = await Promise.all([
      getJson<{ success: boolean; applications: MembershipApplicationRow[] }>(
        `${MEMBERSHIP_PREFIX}/admin/applications`
      ),
      getJson<{ success: boolean; memberships: MembershipRow[] }>(
        `${MEMBERSHIP_PREFIX}/admin/memberships`
      ),
      getJson<{ success: boolean; features: FeatureRow[] }>(`${MEMBERSHIP_PREFIX}/admin/features`),
    ]);
    setLoading(false);

    if (appsRes.ok) setApplications(appsRes.data.applications ?? []);
    else setError(appsRes.error);
    if (memRes.ok) setMemberships(memRes.data.memberships ?? []);
    if (featRes.ok) setFeatures(featRes.data.features ?? []);
    setFeaturesDirty(false);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Seed from the shared context so the list is populated on first paint, then
  // let this section's own fetch take over.
  useEffect(() => {
    if (applications.length === 0 && sharedApplications.data.length > 0) {
      setApplications(sharedApplications.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedApplications.data]);

  const pending = useMemo(
    () => applications.filter((a) => a.status === 'pending'),
    [applications]
  );

  const stats = useMemo(
    () => ({
      total: memberships.length,
      active: memberships.filter((m) => m.status === 'active').length,
      paid: memberships.filter((m) => m.tier !== 'free').length,
      pending: pending.length,
    }),
    [memberships, pending]
  );

  /** Tier distribution, for the mix bar. */
  const tierMix = useMemo(
    () =>
      MEMBERSHIP_TIER_ORDER.map((tier, i) => ({
        tier,
        label: TIER_LABEL[tier] ?? tier,
        count: memberships.filter((m) => m.tier === tier).length,
        color: CHART_COLORS[i % CHART_COLORS.length]!,
      })),
    [memberships]
  );

  /** Refreshes every surface that shows membership state after a write. */
  const afterWrite = async () => {
    await loadAll();
    await refreshMembership();
    void refreshApplications();
    void refreshAudit();
  };

  const review = async (id: string, action: 'approve' | 'reject', tier?: MembershipTier) => {
    setBusy(true);
    setFlash(null);
    const res = await patchJson<{ success: boolean }>(
      `${MEMBERSHIP_PREFIX}/admin/applications/${id}`,
      { action, ...(action === 'approve' && tier ? { tier } : {}) }
    );
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({
      type: 'ok',
      text: `Application ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
    await afterWrite();
  };

  const updateTier = async (userId: string, tier: string, status: string) => {
    setBusy(true);
    setFlash(null);
    const res = await patchJson(`${MEMBERSHIP_PREFIX}/admin/memberships/${userId}`, {
      tier,
      status,
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: 'Membership updated.' });
    await afterWrite();
  };

  const saveFeatures = async () => {
    setBusy(true);
    setFlash(null);
    const res = await putJson(`${MEMBERSHIP_PREFIX}/admin/features`, {
      features: features.map((f) => ({ featureKey: f.featureKey, minTier: f.minTier })),
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: 'Feature access map saved.' });
    setFeaturesDirty(false);
    await loadAll();
    void refreshAudit();
  };

  const setMinTier = (featureKey: string, tier: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.featureKey === featureKey ? { ...f, minTier: tier } : f))
    );
    setFeaturesDirty(true);
  };

  const filteredMemberships = useMemo(
    () => (tierFilter === 'all' ? memberships : memberships.filter((m) => m.tier === tierFilter)),
    [memberships, tierFilter]
  );

  const memberColumns: Column<MembershipRow>[] = [
    {
      key: 'user',
      header: 'Member',
      sortValue: (m) => (m.user?.name ?? '').toLowerCase(),
      cell: (m) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.user?.name ?? 'Unknown'} seed={m.userId} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{m.user?.name ?? 'Unknown'}</p>
            <p className="truncate text-xs text-slate-500">{m.user?.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      sortValue: (m) => MEMBERSHIP_TIER_ORDER.indexOf(m.tier as MembershipTier),
      cell: (m) => <StatusPill status={m.tier} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (m) => m.status,
      cell: (m) => <StatusPill status={m.status} />,
    },
    {
      key: 'renewal',
      header: 'Renews',
      sortValue: (m) => (m.renewalDate ? new Date(m.renewalDate).getTime() : 0),
      className: 'adm-num text-slate-600 hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
      cell: (m) => formatDate(m.renewalDate),
    },
    {
      key: 'change',
      header: 'Change tier',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (m) => (
        <Select
          value={m.tier}
          onValueChange={(tier) =>
            void updateTier(m.userId, tier, m.status === 'none' ? 'active' : m.status)
          }
        >
          <SelectTrigger className="ml-auto h-9 w-[140px] rounded-lg text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEMBERSHIP_TIER_ORDER.map((t) => (
              <SelectItem key={t} value={t}>
                {TIER_LABEL[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Memberships"
        description="Review applications, set tiers, and control which features each tier unlocks."
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">{error}</p>
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={stats.total} icon={UsersIcon} hint="With a membership record" loading={loading} />
        <StatCard label="Active" value={stats.active} icon={BadgeCheck} tone="sky" hint="Currently subscribed" loading={loading} />
        <StatCard label="Paid tiers" value={stats.paid} icon={Sparkles} tone="violet" hint="Above free" loading={loading} />
        <StatCard label="Pending review" value={stats.pending} icon={Clock} tone="amber" hint="Applications waiting" loading={loading} />
      </div>

      {/* Tier mix */}
      {stats.total > 0 && (
        <Panel title="Tier distribution" description="How the member base splits across tiers" className="mb-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {tierMix.map((t) =>
              t.count === 0 ? null : (
                <div
                  key={t.tier}
                  className="h-full transition-all duration-700"
                  style={{ width: `${(t.count / stats.total) * 100}%`, background: t.color }}
                  title={`${t.label}: ${t.count}`}
                />
              )
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {tierMix.map((t) => (
              <li key={t.tier} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                <span className="text-slate-600">{t.label}</span>
                <span className="adm-num font-semibold text-slate-900">{t.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel
        title="Pending applications"
        description={pending.length === 0 ? 'Nothing waiting on you.' : `${pending.length} awaiting review`}
        className="mb-5"
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            title="No applications waiting"
            body="New membership applications will appear here for review."
            icon={BadgeCheck}
          />
        ) : (
          <ul className="space-y-4">
            {pending.map((a) => {
              const tier = approveTier[a.id] ?? 'basic';
              return (
                <li key={a.id} className="rounded-xl border border-[var(--adm-line)] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar name={a.user.name} seed={a.user.id} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">{a.user.name}</p>
                      <p className="truncate text-xs text-slate-500">{a.user.email}</p>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">{formatRelative(a.createdAt)}</span>
                  </div>

                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                    {[
                      { label: 'Motivation', value: a.motivation },
                      { label: 'Interests', value: a.interests },
                      { label: 'Contribution', value: a.communityContribution },
                    ].map((field) => (
                      <div key={field.label} className="rounded-lg bg-slate-50/70 p-3">
                        <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-400">
                          {field.label}
                        </dt>
                        <dd className="mt-1 text-slate-600">{field.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* One approve button plus a tier picker, replacing the two
                      hardcoded "Approve as Basic/Premium" buttons that could
                      never reach the other two tiers. */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Select
                      value={tier}
                      onValueChange={(v) =>
                        setApproveTier((prev) => ({ ...prev, [a.id]: v as MembershipTier }))
                      }
                    >
                      <SelectTrigger className="h-9 w-[150px] rounded-lg text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBERSHIP_TIER_ORDER.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TIER_LABEL[t] ?? t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      disabled={busy}
                      onClick={() => void review(a.id, 'approve', tier)}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                      disabled={busy}
                      onClick={() => void review(a.id, 'reject')}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <div className="mb-5">
        <DataTable
          rows={filteredMemberships}
          columns={memberColumns}
          rowKey={(m) => m.userId}
          loading={loading}
          searchable={(m) => `${m.user?.name ?? ''} ${m.user?.email ?? ''} ${m.tier} ${m.status}`}
          searchPlaceholder="Search members…"
          filters={{
            value: tierFilter,
            onChange: set.setFilter,
            options: [
              { value: 'all', label: 'All', count: memberships.length },
              ...MEMBERSHIP_TIER_ORDER.map((t) => ({
                value: t,
                label: TIER_LABEL[t] ?? t,
                count: memberships.filter((m) => m.tier === t).length,
              })),
            ],
          }}
          emptyTitle="No members"
          emptyBody="Membership records appear once investors apply or are assigned a tier."
        />
      </div>

      {/* Feature access matrix */}
      <Panel
        title="Feature access"
        description="Click a cell to set the minimum tier a feature requires"
        padded={false}
        actions={
          <Button
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            disabled={busy || !featuresDirty}
            onClick={() => void saveFeatures()}
          >
            {busy ? 'Saving…' : featuresDirty ? 'Save changes' : 'Saved'}
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : features.length === 0 ? (
          <EmptyState
            title="No feature mappings"
            body="Feature gates appear here once the platform defines them."
            icon={Lock}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    Feature
                  </th>
                  {MEMBERSHIP_TIER_ORDER.map((t) => (
                    <th
                      key={t}
                      className="px-3 py-3 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500"
                    >
                      {TIER_LABEL[t] ?? t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f) => {
                  const minIndex = MEMBERSHIP_TIER_ORDER.indexOf(f.minTier as MembershipTier);
                  return (
                    <tr key={f.featureKey} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-medium capitalize text-slate-700">
                        {f.featureKey.replace(/[_-]/g, ' ')}
                      </td>
                      {MEMBERSHIP_TIER_ORDER.map((t, i) => {
                        // A tier has the feature when it is at or above the
                        // minimum, so the row reads as a threshold rather than
                        // four unrelated switches.
                        const included = minIndex >= 0 && i >= minIndex;
                        const isThreshold = i === minIndex;
                        return (
                          <td key={t} className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setMinTier(f.featureKey, t)}
                              aria-label={`Require ${TIER_LABEL[t] ?? t} for ${f.featureKey}`}
                              aria-pressed={isThreshold}
                              title={
                                isThreshold
                                  ? `${TIER_LABEL[t] ?? t} is the minimum tier`
                                  : `Set minimum tier to ${TIER_LABEL[t] ?? t}`
                              }
                              className={`adm-focus mx-auto flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                isThreshold
                                  ? 'bg-emerald-600 text-white'
                                  : included
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400'
                              }`}
                            >
                              {included ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
