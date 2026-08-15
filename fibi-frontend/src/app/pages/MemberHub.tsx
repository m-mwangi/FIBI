import { Link } from "react-router";
import {
  CalendarClock,
  Check,
  Lock,
  MessageSquare,
  Settings2,
  Sparkles,
  Video,
} from "lucide-react";
import { useMembership } from "../context/MembershipContext";
import { featureLabel, tierLabel } from "@/lib/membership";
import { EventList } from "../components/membership/EventList";
import { MembershipStatusCard, TierBadge } from "../components/membership/MembershipStatus";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

/**
 * The member's home.
 *
 * Every panel here is driven by real state: the events come from the API and
 * are bookable, and each feature card reflects the gate table rather than a
 * hardcoded assumption about what a tier includes.
 */

const FEATURE_CARDS = [
  {
    featureKey: "exclusive_content",
    icon: Sparkles,
    title: "Exclusive content",
    body: "Deep dives, premium guides, and the member-only media library.",
  },
  {
    featureKey: "community_groups",
    icon: MessageSquare,
    title: "Community rooms",
    body: "Private forums, small member circles, and priority discussion channels.",
  },
  {
    featureKey: "founder_qa",
    icon: Video,
    title: "Founder access",
    body: "Monthly calls and Q&A sessions with the founders building on FIBI.",
  },
  {
    featureKey: "investment_opportunities",
    icon: Sparkles,
    title: "Deal flow",
    body: "Early access to investment opportunities before they open publicly.",
  },
];

export default function MemberHub() {
  const {
    membership,
    stage,
    events,
    entitlements,
    canAccessFeature,
    minTierForFeature,
    bookEvent,
    cancelBooking,
  } = useMembership();

  const upcomingBooked = events.filter((e) => e.registered).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-24">
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Member hub</h1>
            <p className="mt-1 text-slate-600">
              Exclusive content, member events, and private community experiences.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TierBadge membership={membership} />
            <Link to="/membership/billing">
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4" /> Manage
              </Button>
            </Link>
          </div>
        </div>

        {/* Shown when the membership is ending or lapsed — the hub is reachable
            right up to the period end, and that is exactly when it matters. */}
        {stage !== "active" && (
          <MembershipStatusCard membership={membership} stage={stage} compact />
        )}

        <div className="fx-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((card) => {
            const unlocked = canAccessFeature(card.featureKey);
            const needed = minTierForFeature(card.featureKey);
            return (
              <Card
                key={card.featureKey}
                className={unlocked ? "fx-lift" : "border-dashed bg-slate-50/70"}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <card.icon
                      className={`h-5 w-5 ${unlocked ? "text-emerald-600" : "text-slate-400"}`}
                    />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>{card.body}</p>
                  <p className="mt-3">
                    {unlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Check className="h-3.5 w-3.5" /> Included in your tier
                      </span>
                    ) : (
                      <Link
                        to="/membership/billing"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        {needed ? `Needs ${tierLabel(needed)}` : "Not in your tier"}
                      </Link>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-emerald-600" />
                Upcoming member events
              </span>
              {upcomingBooked > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {upcomingBooked} reserved
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventList events={events} onBook={bookEvent} onCancel={cancelBooking} />
          </CardContent>
        </Card>

        {entitlements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Everything your tier unlocks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {entitlements.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {featureLabel(key)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Link to="/membership">
            <Button variant="outline">Compare tiers</Button>
          </Link>
          <Link to="/membership/billing">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Change tier</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
