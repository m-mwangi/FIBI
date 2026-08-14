import { useState } from "react";
import { CalendarClock, Check, Loader2, Lock, MapPin, Users } from "lucide-react";
import { tierLabel, type MemberEvent } from "@/lib/membership";
import { Button } from "../ui/button";

/**
 * Member events, live from the API.
 *
 * A locked event still renders — title, date, and the tier it needs — because
 * the point of showing it is the upgrade. What it does not render is where and
 * what, which the server withholds for anyone who cannot attend.
 */

function formatWhen(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt);
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!endsAt) return `${date} · ${time}`;
  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}–${endTime}`;
}

export function EventList({
  events,
  onBook,
  onCancel,
}: {
  events: MemberEvent[];
  onBook: (eventId: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: (eventId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (
    eventId: string,
    action: (id: string) => Promise<{ success: boolean; error?: string }>
  ) => {
    setBusyId(eventId);
    setError(null);
    const res = await action(eventId);
    setBusyId(null);
    if (!res.success) setError(res.error ?? "Something went wrong.");
  };

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <CalendarClock className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 font-medium text-slate-700">No upcoming events</p>
        <p className="mt-1 text-sm text-slate-500">
          New member events are announced here as they're scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {events.map((event) => {
        const full = event.seatsLeft === 0 && !event.registered;
        return (
          <div
            key={event.id}
            className={`flex flex-wrap items-start gap-4 rounded-xl border p-4 ${
              event.locked ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-900">{event.title}</p>
                {event.locked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600">
                    <Lock className="h-3 w-3" />
                    {tierLabel(event.minTier)}+
                  </span>
                )}
                {event.registered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-800">
                    <Check className="h-3 w-3" /> Reserved
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">{formatWhen(event.startsAt, event.endsAt)}</p>

              {event.locked ? (
                <p className="mt-2 text-sm text-slate-500">
                  Details unlock at the {tierLabel(event.minTier)} tier.
                </p>
              ) : (
                <>
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                    {event.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </span>
                    )}
                    {event.seatsLeft != null && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.seatsLeft} of {event.capacity} seats left
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="shrink-0">
              {event.locked ? (
                <Button variant="outline" size="sm" disabled>
                  <Lock className="h-4 w-4" /> Locked
                </Button>
              ) : event.registered ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === event.id}
                  onClick={() => void run(event.id, onCancel)}
                >
                  {busyId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Cancel booking
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={busyId === event.id || full}
                  onClick={() => void run(event.id, onBook)}
                >
                  {busyId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {full ? "Full" : "Reserve seat"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
