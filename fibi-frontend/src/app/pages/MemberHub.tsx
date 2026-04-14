import { CalendarClock, Lock, MessageSquare, Sparkles, Video } from "lucide-react";
import { useMembership } from "../context/MembershipContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router";

const EVENTS = [
  { id: "ev-1", name: "Founder AMA", tier: "premium", date: "Apr 12, 2026" },
  { id: "ev-2", name: "Investor Circle Dinner", tier: "investor_plus", date: "Apr 28, 2026" },
  { id: "ev-3", name: "Member Growth Workshop", tier: "basic", date: "May 03, 2026" },
] as const;

export default function MemberHub() {
  const { membership, canAccessTier } = useMembership();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Member Hub</h1>
            <p className="text-slate-600 mt-1">
              Exclusive content, member events, and private community experiences.
            </p>
          </div>
          <Badge className="capitalize">{membership.tier.replace("_", " ")}</Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Exclusive Content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Deep dives, premium guides, and curated member-only media library.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Community Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Private forums, small member circles, and priority discussion channels.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-emerald-600" />
                Founder Access
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Monthly calls and Q&A sessions reserved for Premium and Investor+ tiers.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-emerald-600" />
              Member Events and Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EVENTS.map((event) => {
              const unlocked = canAccessTier(event.tier);
              return (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 flex items-center justify-between gap-4 bg-white"
                >
                  <div>
                    <p className="font-medium text-slate-900">{event.name}</p>
                    <p className="text-xs text-slate-500">
                      {event.date} · Tier required: {event.tier.replace("_", " ")}
                    </p>
                  </div>
                  {unlocked ? (
                    <Button size="sm">Reserve seat</Button>
                  ) : (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Locked
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link to="/membership">
            <Button variant="outline">Compare tiers</Button>
          </Link>
          <Link to="/membership/apply">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Apply or upgrade</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
