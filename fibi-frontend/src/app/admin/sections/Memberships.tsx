import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Check, Sparkles, TriangleAlert, Users as UsersIcon, X } from 'lucide-react';
import { getJson, patchJson, putJson, MEMBERSHIP_PREFIX } from '@/lib/api';
import { MEMBERSHIP_TIER_ORDER, type MembershipTier } from '@/lib/membership';
import { useMembership } from '../../context/MembershipContext';
import { DataTable, type Column } from '../components/DataTable';
import { Flash, PageHeader, Panel, StatCard, StatusPill } from '../components/primitives';
import { formatDate } from '../lib/format';
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

  const [applications, setApplications] = useState<MembershipApplicationRow[]>([]);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [tierFilter, setTierFilter] = useState('all');
  const [featuresDirty, setFeaturesDirty] = useState(false);

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
    await loadAll();
    await refreshMembership();
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
    await loadAll();
    await refreshMembership();
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
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{m.user?.name ?? 'Unknown'}</p>
          <p className="truncate text-xs text-slate-500">{m.user?.email ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      sortValue: (m) => m.tier,
      cell: (m) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          <Sparkles className="h-3 w-3 text-emerald-600" />
          {TIER_LABEL[m.tier] ?? m.tier}
        </span>
      ),
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
      className: 'text-slate-600',
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
          onValueChange={(tier) => void updateTier(m.userId, tier, m.status === 'none' ? 'active' : m.status)}
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={stats.total} icon={UsersIcon} hint="With a membership record" loading={loading} />
        <StatCard label="Active" value={stats.active} icon={BadgeCheck} hint="Currently subscribed" loading={loading} />
        <StatCard label="Paid tiers" value={stats.paid} icon={Sparkles} hint="Above free" loading={loading} />
        <StatCard label="Pending review" value={stats.pending} icon={TriangleAlert} hint="Applications waiting" loading={loading} />
      </div>

      <Panel
        title="Pending applications"
        description={pending.length === 0 ? 'Nothing waiting on you.' : `${pending.length} awaiting review`}
        className="mb-6"
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No applications are waiting for review.
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((a) => (
              <li key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-800">{a.user.name}</span>
                  <span className="text-sm text-slate-500">{a.user.email}</span>
                  <StatusPill status={a.user.role} />
                  <span className="ml-auto text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                </div>

                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Motivation</dt>
                    <dd className="mt-1 text-slate-600">{a.motivation || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Interests</dt>
                    <dd className="mt-1 text-slate-600">{a.interests || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Contribution</dt>
                    <dd className="mt-1 text-slate-600">{a.communityContribution || '—'}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    disabled={busy}
                    onClick={() => void review(a.id, 'approve', 'basic')}
                  >
                    <Check className="h-4 w-4" /> Approve as Basic
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    disabled={busy}
                    onClick={() => void review(a.id, 'approve', 'premium')}
                  >
                    Approve as Premium
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
            ))}
          </ul>
        )}
      </Panel>

      <div className="mb-6">
        <DataTable
          rows={filteredMemberships}
          columns={memberColumns}
          rowKey={(m) => m.userId}
          loading={loading}
          searchable={(m) => `${m.user?.name ?? ''} ${m.user?.email ?? ''} ${m.tier} ${m.status}`}
          searchPlaceholder="Search members…"
          filters={{
            value: tierFilter,
            onChange: setTierFilter,
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

      <Panel
        title="Feature access"
        description="The minimum tier required to reach each platform feature"
        actions={
          <Button
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            disabled={busy || !featuresDirty}
            onClick={() => void saveFeatures()}
          >
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : features.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No feature mappings configured.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {features.map((f) => (
              <li key={f.featureKey} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm font-medium capitalize text-slate-700">
                  {f.featureKey.replace(/[_-]/g, ' ')}
                </span>
                <Select
                  value={f.minTier}
                  onValueChange={(tier) => {
                    setFeatures((prev) =>
                      prev.map((x) => (x.featureKey === f.featureKey ? { ...x, minTier: tier } : x))
                    );
                    setFeaturesDirty(true);
                  }}
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
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
