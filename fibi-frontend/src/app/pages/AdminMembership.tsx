import { useCallback, useEffect, useState } from "react";
import { useMembership } from "../context/MembershipContext";
import { MEMBERSHIP_PLANS, type MembershipTier } from "@/lib/membership";
import { getJson, patchJson, putJson, MEMBERSHIP_PREFIX } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

type ApplicationRow = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; role: string };
  motivation: string;
  interests: string;
  communityContribution: string;
  status: string;
  adminFeedback: string | null;
  createdAt: string;
};

type MembershipRow = {
  tier: string;
  status: string;
  applicationStatus: string;
  renewalDate: string | null;
  badgeLabel: string | null;
  userId: string;
  user: { id: string; name: string; email: string; role: string };
};

type FeatureRow = { featureKey: string; minTier: string };

export default function AdminMembership() {
  const { membership, refreshMembership } = useMembership();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [adminUserId, setAdminUserId] = useState("");
  const [patchTier, setPatchTier] = useState<MembershipTier>("basic");
  const [patchStatus, setPatchStatus] = useState<"none" | "active" | "expired" | "canceled">("active");

  const loadAll = useCallback(async () => {
    setErr("");
    const [appsRes, memRes, featRes] = await Promise.all([
      getJson<{ success: boolean; applications: ApplicationRow[] }>(
        `${MEMBERSHIP_PREFIX}/admin/applications`
      ),
      getJson<{ success: boolean; memberships: MembershipRow[] }>(
        `${MEMBERSHIP_PREFIX}/admin/memberships`
      ),
      getJson<{ success: boolean; features: FeatureRow[] }>(`${MEMBERSHIP_PREFIX}/admin/features`),
    ]);
    if (appsRes.ok) setApplications(appsRes.data.applications ?? []);
    else setErr(appsRes.error);
    if (memRes.ok) setMemberships(memRes.data.memberships ?? []);
    if (featRes.ok) setFeatures(featRes.data.features ?? []);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const review = async (id: string, action: "approve" | "reject", tier?: MembershipTier) => {
    setBusy(true);
    setMsg("");
    setErr("");
    const res = await patchJson<{ success: boolean }>(`${MEMBERSHIP_PREFIX}/admin/applications/${id}`, {
      action,
      ...(action === "approve" && tier ? { tier } : {}),
    });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(`Application ${action === "approve" ? "approved" : "rejected"}.`);
    await loadAll();
    await refreshMembership();
  };

  const saveUserMembership = async () => {
    if (!adminUserId.trim()) {
      setErr("Enter a user ID");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await patchJson(`${MEMBERSHIP_PREFIX}/admin/memberships/${adminUserId.trim()}`, {
      tier: patchTier,
      status: patchStatus,
    });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg("Membership updated.");
    await loadAll();
    await refreshMembership();
  };

  const saveFeatures = async () => {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await putJson(`${MEMBERSHIP_PREFIX}/admin/features`, {
      features: features.map((f) => ({ featureKey: f.featureKey, minTier: f.minTier })),
    });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg("Feature map saved.");
    await loadAll();
  };

  const updateFeatureTier = (featureKey: string, minTier: MembershipTier) => {
    setFeatures((prev) => prev.map((f) => (f.featureKey === featureKey ? { ...f, minTier } : f)));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin Membership Control</h1>
        {msg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{msg}</p>}
        {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>}

        <Card>
          <CardHeader>
            <CardTitle>Your session membership (preview)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Tier <span className="font-medium">{membership.tier}</span> · Status{" "}
            <span className="font-medium">{membership.status}</span> · Application{" "}
            <span className="font-medium">{membership.applicationStatus}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending applications</CardTitle>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void loadAll()}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.filter((a) => a.status === "pending").length === 0 ? (
              <p className="text-sm text-slate-500">No pending applications.</p>
            ) : (
              applications
                .filter((a) => a.status === "pending")
                .map((a) => (
                  <div key={a.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-medium">{a.user.name}</span>
                      <span className="text-sm text-slate-500">{a.user.email}</span>
                      <Badge variant="outline">{a.user.role}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{a.motivation}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={busy}
                        onClick={() => void review(a.id, "approve", "basic")}
                      >
                        Approve (Basic)
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void review(a.id, "approve", "premium")}>
                        Approve (Premium)
                      </Button>
                      <Button size="sm" variant="destructive" disabled={busy} onClick={() => void review(a.id, "reject")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update membership by user ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-w-md">
            <div>
              <Label htmlFor="uid">User ID</Label>
              <Input id="uid" value={adminUserId} onChange={(e) => setAdminUserId(e.target.value)} placeholder="uuid" />
            </div>
            <div>
              <Label>Tier</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                value={patchTier}
                onChange={(e) => setPatchTier(e.target.value as MembershipTier)}
              >
                <option value="free">free</option>
                <option value="basic">basic</option>
                <option value="premium">premium</option>
                <option value="investor_plus">investor_plus</option>
              </select>
            </div>
            <div>
              <Label>Subscription status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                value={patchStatus}
                onChange={(e) => setPatchStatus(e.target.value as typeof patchStatus)}
              >
                <option value="none">none</option>
                <option value="active">active</option>
                <option value="expired">expired</option>
                <option value="canceled">canceled</option>
              </select>
            </div>
            <Button disabled={busy} onClick={() => void saveUserMembership()}>
              Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All memberships</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 max-h-64 overflow-y-auto">
            {memberships.map((m) => (
              <div key={m.userId} className="flex justify-between gap-2 border-b pb-2">
                <span className="truncate">{m.user.email}</span>
                <span className="shrink-0 text-slate-600">
                  {m.tier} / {m.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan reference (static UI)</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {MEMBERSHIP_PLANS.map((plan) => (
              <div key={plan.tier} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <Badge variant="outline">${plan.monthlyPrice}/mo</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                <p className="text-xs text-slate-400 mt-2">Manage plans via API: PUT {MEMBERSHIP_PREFIX}/admin/plans</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Feature → minimum tier</CardTitle>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void saveFeatures()}>
              Save feature map
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {features.length === 0 ? (
              <p className="text-sm text-slate-500">Loading features…</p>
            ) : (
              features.map((f) => (
                <div key={f.featureKey} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <p className="text-sm text-slate-700 font-mono">{f.featureKey}</p>
                  <select
                    value={f.minTier}
                    onChange={(e) => updateFeatureTier(f.featureKey, e.target.value as MembershipTier)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="free">free</option>
                    <option value="basic">basic</option>
                    <option value="premium">premium</option>
                    <option value="investor_plus">investor_plus</option>
                  </select>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
