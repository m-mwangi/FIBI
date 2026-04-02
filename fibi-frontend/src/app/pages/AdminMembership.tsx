import { useState } from "react";
import { useMembership } from "../context/MembershipContext";
import { MEMBERSHIP_PLANS, type MembershipTier } from "@/lib/membership";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function AdminMembership() {
  const { membership, setApplicationStatus, setMembershipTier, setMembershipStatus } = useMembership();
  const [featureMap, setFeatureMap] = useState<Record<string, MembershipTier>>({
    "exclusive-content": "basic",
    "member-events": "basic",
    "community-groups": "basic",
    "premium-services": "premium",
    "investment-opportunities": "investor_plus",
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin Membership Control</h1>

        <Card>
          <CardHeader>
            <CardTitle>Application lifecycle controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              Use this panel to simulate application review and subscription lifecycle states.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setApplicationStatus("pending")}>
                Mark pending
              </Button>
              <Button variant="outline" onClick={() => setApplicationStatus("approved")}>
                Approve
              </Button>
              <Button variant="outline" onClick={() => setApplicationStatus("rejected")}>
                Reject
              </Button>
              <Button variant="outline" onClick={() => setMembershipStatus("active")}>
                Activate subscription
              </Button>
              <Button variant="outline" onClick={() => setMembershipStatus("expired")}>
                Expire subscription
              </Button>
              <Button variant="outline" onClick={() => setMembershipStatus("canceled")}>
                Cancel subscription
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Current: application <span className="font-medium">{membership.applicationStatus}</span>, status{" "}
              <span className="font-medium">{membership.status}</span>, tier{" "}
              <span className="font-medium">{membership.tier}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan management</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {MEMBERSHIP_PLANS.map((plan) => (
              <div key={plan.tier} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <Badge variant="outline">${plan.monthlyPrice}/mo</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                <Button
                  size="sm"
                  className="mt-3"
                  variant={membership.tier === plan.tier ? "default" : "outline"}
                  onClick={() => setMembershipTier(plan.tier)}
                >
                  {membership.tier === plan.tier ? "Assigned" : "Assign tier"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature segmentation matrix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(featureMap).map(([feature, tier]) => (
              <div key={feature} className="flex items-center justify-between border rounded-md px-3 py-2">
                <p className="text-sm text-slate-700 capitalize">{feature.replace("-", " ")}</p>
                <select
                  value={tier}
                  onChange={(e) =>
                    setFeatureMap((prev) => ({ ...prev, [feature]: e.target.value as MembershipTier }))
                  }
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="investor_plus">Investor+</option>
                </select>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
