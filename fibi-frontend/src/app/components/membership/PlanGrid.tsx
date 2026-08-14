import { useState } from "react";
import { Link } from "react-router";
import { Check, Loader2, Lock, Sparkles } from "lucide-react";
import { formatMoney } from "@/lib/money";
import {
  featureLabel,
  membershipTierRank,
  tierLabel,
  type MembershipPlan,
  type MembershipProfile,
  type MembershipStage,
  type MembershipTier,
} from "@/lib/membership";
import { Button } from "../ui/button";

/**
 * The pricing table, rendered from the plans the admin console edits.
 *
 * Nothing here is hardcoded: price, currency, copy, and the feature list all
 * come from `/membership/plans`, so changing a price in the console changes the
 * page.
 */

type CheckoutOutcome = {
  success: boolean;
  error?: string;
  nextAction?: { type: string; url?: string; reference?: string; instructions?: string };
};

export function PlanGrid({
  plans,
  membership,
  stage,
  isAuthenticated,
  onCheckout,
}: {
  plans: MembershipPlan[];
  membership: MembershipProfile;
  stage: MembershipStage;
  isAuthenticated: boolean;
  /** Omitted on the public landing page, where the CTA is "apply" not "pay". */
  onCheckout?: (tier: MembershipTier) => Promise<CheckoutOutcome>;
}) {
  const [busyTier, setBusyTier] = useState<MembershipTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<CheckoutOutcome["nextAction"] | null>(null);

  // The middle paid tier is the recommended one; derived rather than stored so
  // adding a tier in the console does not leave a stale "Popular" flag behind.
  const paidPlans = plans.filter((p) => p.monthlyPriceMinor > 0);
  const highlightTier = paidPlans.length > 1 ? paidPlans[Math.floor((paidPlans.length - 1) / 2)]?.tier : undefined;

  const pay = async (tier: MembershipTier) => {
    if (!onCheckout) return;
    setBusyTier(tier);
    setError(null);
    setInstructions(null);
    const res = await onCheckout(tier);
    setBusyTier(null);
    if (!res.success) {
      setError(res.error ?? "Could not start checkout.");
      return;
    }
    // A card rail hands back a redirect; a wire hands back instructions the
    // member needs to keep. Both are first-class outcomes.
    if (res.nextAction?.type === "redirect" && res.nextAction.url) {
      window.location.href = res.nextAction.url;
      return;
    }
    setInstructions(res.nextAction ?? { type: "none" });
  };

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Membership plans are being set up. Check back shortly.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {instructions && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <p className="font-semibold">Payment started</p>
          {instructions.reference && (
            <p className="mt-1">
              Reference: <span className="font-mono font-semibold">{instructions.reference}</span>
            </p>
          )}
          <p className="mt-1 text-sky-800">
            {instructions.instructions ??
              "Your membership activates as soon as the payment is confirmed."}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = membership.tier === plan.tier && membership.status === "active";
          const isPending = membership.pendingTier === plan.tier && stage === "awaiting_payment";
          const isHighlighted = plan.tier === highlightTier;
          const direction = membershipTierRank(plan.tier) - membershipTierRank(membership.tier);
          const free = plan.monthlyPriceMinor === 0;

          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md ${
                isCurrent
                  ? "border-emerald-400 ring-2 ring-emerald-200"
                  : isHighlighted
                    ? "border-emerald-300 ring-1 ring-emerald-100"
                    : "border-slate-200"
              }`}
            >
              {isHighlighted && !isCurrent && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white">
                  Most popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white">
                  Your tier
                </span>
              )}

              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {free ? "Free" : formatMoney(plan.monthlyPriceMinor, plan.currency)}
                </span>
                {!free && <span className="text-sm text-slate-500"> /month</span>}
              </p>
              <p className="mt-2 min-h-[2.5rem] text-sm text-slate-600">{plan.description}</p>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.length === 0 ? (
                  <li className="flex items-start gap-2 text-sm text-slate-500">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    Public access only
                  </li>
                ) : (
                  plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {featureLabel(feature)}
                    </li>
                  ))
                )}
              </ul>

              <div className="mt-5">
                {free ? (
                  <Button variant="outline" className="w-full" disabled>
                    Included for everyone
                  </Button>
                ) : !isAuthenticated ? (
                  <Link to="/login" className="block">
                    <Button variant={isHighlighted ? "default" : "outline"} className="w-full">
                      Log in to join
                    </Button>
                  </Link>
                ) : !onCheckout || stage === "visitor" || stage === "rejected" || stage === "pending" ? (
                  <Link to="/membership/apply" className="block">
                    <Button
                      variant={isHighlighted ? "default" : "outline"}
                      className={`w-full ${isHighlighted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                      disabled={stage === "pending"}
                    >
                      {stage === "pending" ? "Application under review" : "Apply to join"}
                    </Button>
                  </Link>
                ) : isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current tier
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${isHighlighted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    variant={isHighlighted ? "default" : "outline"}
                    disabled={busyTier !== null}
                    onClick={() => void pay(plan.tier)}
                  >
                    {busyTier === plan.tier ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                      </>
                    ) : isPending ? (
                      <>
                        <Sparkles className="h-4 w-4" /> Activate {plan.name}
                      </>
                    ) : membership.status === "active" && direction > 0 ? (
                      `Upgrade to ${plan.name}`
                    ) : membership.status === "active" && direction < 0 ? (
                      `Switch to ${plan.name}`
                    ) : (
                      `Join ${plan.name}`
                    )}
                  </Button>
                )}
              </div>

              {isPending && (
                <p className="mt-2 text-center text-xs text-sky-700">
                  Approved for {tierLabel(plan.tier)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
