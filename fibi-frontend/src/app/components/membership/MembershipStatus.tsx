import { Link } from "react-router";
import {
  BadgeCheck,
  Clock,
  CreditCard,
  CalendarX2,
  ShieldAlert,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  STAGE_COPY,
  tierLabel,
  type MembershipProfile,
  type MembershipStage,
} from "@/lib/membership";
import { Button } from "../ui/button";

/**
 * The member's standing, rendered the same way everywhere it appears.
 *
 * One component per stage rather than a status string per page, so the landing
 * page, the hub, and the billing page cannot tell the member three different
 * stories about where they stand.
 */

type StageStyle = {
  icon: LucideIcon;
  ring: string;
  chip: string;
  iconWrap: string;
};

const STAGE_STYLES: Record<MembershipStage, StageStyle> = {
  visitor: {
    icon: UserPlus,
    ring: "border-slate-200 bg-white",
    chip: "bg-slate-100 text-slate-700",
    iconWrap: "bg-slate-100 text-slate-500",
  },
  pending: {
    icon: Clock,
    ring: "border-amber-200 bg-amber-50/60",
    chip: "bg-amber-100 text-amber-800",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  rejected: {
    icon: ShieldAlert,
    ring: "border-rose-200 bg-rose-50/60",
    chip: "bg-rose-100 text-rose-800",
    iconWrap: "bg-rose-100 text-rose-700",
  },
  awaiting_payment: {
    icon: CreditCard,
    ring: "border-sky-200 bg-sky-50/60",
    chip: "bg-sky-100 text-sky-800",
    iconWrap: "bg-sky-100 text-sky-700",
  },
  active: {
    icon: BadgeCheck,
    ring: "border-emerald-200 bg-emerald-50/60",
    chip: "bg-emerald-100 text-emerald-800",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
  ending: {
    icon: CalendarX2,
    ring: "border-amber-200 bg-amber-50/60",
    chip: "bg-amber-100 text-amber-800",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  expired: {
    icon: CalendarX2,
    ring: "border-slate-200 bg-slate-50",
    chip: "bg-slate-200 text-slate-700",
    iconWrap: "bg-slate-200 text-slate-600",
  },
  canceled: {
    icon: CalendarX2,
    ring: "border-slate-200 bg-slate-50",
    chip: "bg-slate-200 text-slate-700",
    iconWrap: "bg-slate-200 text-slate-600",
  },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Small inline pill — for headers and cards where the full card is too heavy. */
export function TierBadge({
  membership,
  className = "",
}: {
  membership: MembershipProfile;
  className?: string;
}) {
  const isActive = membership.status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
      } ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {tierLabel(membership.tier)}
      {!isActive && " · inactive"}
    </span>
  );
}

/**
 * The headline "where you stand" card, with the one action that stage calls for.
 */
export function MembershipStatusCard({
  membership,
  stage,
  feedback,
  compact = false,
}: {
  membership: MembershipProfile;
  stage: MembershipStage;
  /** Reviewer's note, shown on a rejection so the applicant knows why. */
  feedback?: string | null;
  compact?: boolean;
}) {
  const copy = STAGE_COPY[stage];
  const style = STAGE_STYLES[stage];
  const Icon = style.icon;

  const detail = (() => {
    switch (stage) {
      case "active":
        return membership.renewalDate
          ? `${tierLabel(membership.tier)} · renews ${formatDate(membership.renewalDate)}${
              membership.daysRemaining != null ? ` (${membership.daysRemaining} days)` : ""
            }`
          : tierLabel(membership.tier);
      case "ending":
        return `${tierLabel(membership.tier)} · access until ${formatDate(membership.renewalDate)}`;
      case "awaiting_payment":
        return membership.pendingTier
          ? `Approved for ${tierLabel(membership.pendingTier)}`
          : "Approved — choose a tier";
      case "expired":
      case "canceled":
        return `Last tier: ${tierLabel(membership.tier)} · ended ${formatDate(membership.renewalDate)}`;
      default:
        return null;
    }
  })();

  const action = (() => {
    switch (stage) {
      case "visitor":
      case "rejected":
        return { to: "/membership/apply", label: "Apply for membership" };
      case "awaiting_payment":
        return { to: "/membership/billing", label: "Activate membership" };
      case "expired":
      case "canceled":
        return { to: "/membership/billing", label: "Renew membership" };
      case "ending":
        return { to: "/membership/billing", label: "Manage membership" };
      case "active":
        return { to: "/member-hub", label: "Open member hub" };
      default:
        return null;
    }
  })();

  return (
    <div className={`rounded-2xl border ${style.ring} ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      {/* Stacked until `sm`. Side by side, the non-shrinking action button and
          the 44px icon left the copy about 40px of a 320px screen, which wrapped
          the status to one word per line and ran the button over it. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}>
                {copy.label}
              </span>
              {detail && <span className="text-xs text-slate-500">{detail}</span>}
            </div>
            <p className={`mt-2 text-slate-700 ${compact ? "text-sm" : ""}`}>{copy.blurb}</p>
            {feedback && stage === "rejected" && (
              <blockquote className="mt-3 rounded-lg border-l-2 border-rose-300 bg-white/70 px-3 py-2 text-sm text-slate-600">
                {feedback}
              </blockquote>
            )}
          </div>
        </div>
        {action && (
          <Link to={action.to} className="shrink-0 max-sm:w-full">
            <Button className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 sm:h-9 sm:w-auto">
              {action.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
