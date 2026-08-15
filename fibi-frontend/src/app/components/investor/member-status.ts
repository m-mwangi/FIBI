import { tierLabel, type MembershipProfile, type MembershipStage } from '@/lib/membership';

/**
 * The member's standing, reduced to what the portal chrome can show in one
 * pill: a word, a line of detail, and the one thing to do about it.
 *
 * Derived from the same `stage` the membership pages use, so the bar, the
 * account menu and the billing page can never disagree about where someone
 * stands.
 */

export type MemberStatusTone = 'brand' | 'amber' | 'sky' | 'slate';

export type MemberStatus = {
  /** One or two words for the pill. */
  label: string;
  /** Secondary line — a countdown, or what happens next. */
  detail: string;
  tone: MemberStatusTone;
  /** Present only when the member has something to act on. */
  action: { label: string; to: string } | null;
};

function inDays(days: number | null): string | null {
  if (days === null || days < 0) return null;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function memberStatus(
  membership: MembershipProfile,
  stage: MembershipStage
): MemberStatus {
  const when = inDays(membership.daysRemaining);

  switch (stage) {
    case 'active':
      return {
        label: tierLabel(membership.tier),
        detail: when ? `Renews ${when}` : 'Membership active',
        tone: 'brand',
        action: null,
      };
    case 'ending':
      return {
        label: tierLabel(membership.tier),
        detail: when ? `Access ends ${when}` : 'Access ends at period end',
        tone: 'amber',
        action: { label: 'Resume', to: '/membership/billing' },
      };
    case 'awaiting_payment':
      return {
        label: 'Approved',
        detail: 'Choose a tier to activate',
        tone: 'sky',
        action: { label: 'Activate', to: '/membership/billing' },
      };
    case 'pending':
      return {
        label: 'Under review',
        detail: "We'll email you a decision",
        tone: 'amber',
        action: null,
      };
    case 'expired':
      return {
        label: 'Expired',
        detail: 'Renew to restore access',
        tone: 'slate',
        action: { label: 'Renew', to: '/membership/billing' },
      };
    case 'canceled':
      return {
        label: 'Cancelled',
        detail: 'Rejoin any time',
        tone: 'slate',
        action: { label: 'Rejoin', to: '/membership' },
      };
    case 'rejected':
      return {
        label: 'Not accepted',
        detail: 'You can apply again',
        tone: 'slate',
        action: { label: 'Apply', to: '/membership/apply' },
      };
    case 'visitor':
    default:
      return {
        label: 'Investor',
        detail: 'Not a member yet',
        tone: 'slate',
        action: { label: 'Apply', to: '/membership/apply' },
      };
  }
}

/** Pill colours on the dark bar. */
export const STATUS_TONE_ON_DARK: Record<MemberStatusTone, string> = {
  brand: 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/25',
  amber: 'bg-amber-400/15 text-amber-200 ring-amber-300/25',
  sky: 'bg-sky-400/15 text-sky-200 ring-sky-300/25',
  slate: 'bg-white/10 text-slate-200 ring-white/15',
};

/** The same pill on a light surface — menus, cards, the marketing nav. */
export const STATUS_TONE_ON_LIGHT: Record<MemberStatusTone, string> = {
  brand: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};
