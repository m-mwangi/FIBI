import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Loader2, MapPin, Users, X } from 'lucide-react';
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  MEMBERSHIP_PREFIX,
} from '@/lib/api';
import { MEMBERSHIP_TIER_ORDER, tierLabel, type MembershipTier } from '@/lib/membership';
import type { MemberEventRow } from '../../lib/types';
import { EmptyState, Flash, Panel } from '../../components/primitives';
import { formatDate } from '../../lib/format';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

/**
 * Member events.
 *
 * `adminCreateMemberEvent` and the registrations endpoint have existed since
 * membership shipped, with no console screen able to call either — so events
 * could only be created with curl, and nobody could see who had booked.
 */

const EMPTY_FORM = {
  title: '',
  description: '',
  startsAt: '',
  endsAt: '',
  location: '',
  minTier: 'basic' as MembershipTier,
  capacity: '',
};

type Registration = {
  id: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  event: { id: string; title: string };
};

export function EventsPanel() {
  const [events, setEvents] = useState<MemberEventRow[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson<{ success: boolean; events: MemberEventRow[] }>(
      `${MEMBERSHIP_PREFIX}/admin/events`
    );
    setLoading(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setEvents(res.data.events ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadRegistrations = async (eventId: string) => {
    if (openEventId === eventId) {
      setOpenEventId(null);
      return;
    }
    setOpenEventId(eventId);
    const res = await getJson<{ success: boolean; registrations: Registration[] }>(
      `${MEMBERSHIP_PREFIX}/admin/event-registrations?eventId=${encodeURIComponent(eventId)}`
    );
    if (res.ok) setRegistrations(res.data.registrations ?? []);
  };

  const create = async () => {
    setBusy(true);
    setFlash(null);
    const res = await postJson<{ success: boolean }>(`${MEMBERSHIP_PREFIX}/admin/events`, {
      title: form.title,
      description: form.description || null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      location: form.location || null,
      minTier: form.minTier,
      capacity: form.capacity === '' ? null : Number(form.capacity),
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: 'Event created.' });
    setForm(EMPTY_FORM);
    setCreating(false);
    await load();
  };

  const setTier = async (event: MemberEventRow, minTier: string) => {
    setBusy(true);
    const res = await patchJson(`${MEMBERSHIP_PREFIX}/admin/events/${event.id}`, { minTier });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    await load();
  };

  const cancelEvent = async (event: MemberEventRow) => {
    setBusy(true);
    const res = await deleteJson(`${MEMBERSHIP_PREFIX}/admin/events/${event.id}`);
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: `"${event.title}" cancelled — bookings are kept for the record.` });
    await load();
  };

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.startsAt).getTime() >= now),
      past: events.filter((e) => new Date(e.startsAt).getTime() < now),
    };
  }, [events]);

  const canCreate = form.title.trim().length > 0 && form.startsAt !== '';

  const renderEvent = (event: MemberEventRow) => (
    <div
      key={event.id}
      className={`rounded-xl border p-4 ${
        event.active ? 'border-[var(--adm-line)]' : 'border-dashed border-slate-300 bg-slate-50/60'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-800">{event.title}</p>
            {!event.active && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600">
                Cancelled
              </span>
            )}
          </div>
          <p className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-slate-500">
            <span>{formatDate(event.startsAt)}</span>
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.registrationCount}
              {event.capacity != null ? ` / ${event.capacity}` : ''} booked
            </span>
          </p>
        </div>

        <Select value={event.minTier} onValueChange={(v) => void setTier(event, v)}>
          <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEMBERSHIP_TIER_ORDER.map((t) => (
              <SelectItem key={t} value={t}>
                {tierLabel(t)}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => void loadRegistrations(event.id)}
        >
          {openEventId === event.id ? 'Hide' : 'Attendees'}
        </Button>

        {event.active && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
            disabled={busy}
            onClick={() => void cancelEvent(event)}
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
        )}
      </div>

      {openEventId === event.id && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          {registrations.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {registrations.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-slate-700">
                    {r.user.name} <span className="text-slate-400">· {r.user.email}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                      r.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Panel
      title="Member events"
      description="Create events, set the tier that unlocks them, and see who has booked."
      actions={
        <Button
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCreating((v) => !v)}
        >
          <CalendarPlus className="h-4 w-4" />
          {creating ? 'Close' : 'New event'}
        </Button>
      }
    >
      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      {creating && (
        <div className="mb-5 rounded-xl border border-[var(--adm-line)] bg-slate-50/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 h-9 rounded-lg"
                placeholder="Founder AMA"
              />
            </div>
            <div>
              <Label className="text-xs">Starts</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="mt-1 h-9 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs">Ends (optional)</Label>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="mt-1 h-9 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1 h-9 rounded-lg"
                placeholder="Nairobi · Kilimani studio"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Minimum tier</Label>
                <Select
                  value={form.minTier}
                  onValueChange={(v) => setForm({ ...form, minTier: v as MembershipTier })}
                >
                  <SelectTrigger className="mt-1 h-9 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_TIER_ORDER.map((t) => (
                      <SelectItem key={t} value={t}>
                        {tierLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Capacity</Label>
                <Input
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  inputMode="numeric"
                  className="mt-1 h-9 rounded-lg"
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 min-h-[72px] rounded-lg"
                placeholder="What happens, who it's for."
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={!canCreate || busy}
              onClick={() => void create()}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create event
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          body="Create your first member event — it appears on the member hub straight away."
          icon={CalendarPlus}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Upcoming ({upcoming.length})
            </p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing scheduled.</p>
            ) : (
              upcoming.map(renderEvent)
            )}
          </div>

          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Past ({past.length})
              </p>
              {past.map(renderEvent)}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
