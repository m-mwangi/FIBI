import {
  BadgeCheck,
  FolderOpen,
  PenLine,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserMinus,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, EmptyState, Skeleton } from './primitives';
import { formatRelative } from '../lib/format';
import type { AuditEntry } from '../lib/types';

/**
 * Renders the admin audit trail.
 *
 * Shared by the Overview panel and the Settings > Activity section so one
 * action never reads two different ways in two places.
 */

const ACTION_META: Record<string, { verb: string; icon: LucideIcon; chip: string }> = {
  'user.delete': { verb: 'deleted the account', icon: UserMinus, chip: 'bg-rose-50 text-rose-600' },
  'project.create': { verb: 'created the project', icon: FolderOpen, chip: 'bg-emerald-50 text-emerald-600' },
  'project.update': { verb: 'edited the project', icon: PenLine, chip: 'bg-sky-50 text-sky-600' },
  'project.delete': { verb: 'deleted the project', icon: Trash2, chip: 'bg-rose-50 text-rose-600' },
  'settings.update': { verb: 'changed', icon: SlidersHorizontal, chip: 'bg-violet-50 text-violet-600' },
  'membership.application.approve': {
    verb: 'approved the application from',
    icon: BadgeCheck,
    chip: 'bg-emerald-50 text-emerald-600',
  },
  'membership.application.reject': {
    verb: 'rejected the application from',
    icon: BadgeCheck,
    chip: 'bg-rose-50 text-rose-600',
  },
  'membership.update': { verb: 'changed the membership of', icon: BadgeCheck, chip: 'bg-violet-50 text-violet-600' },
  'membership.features.update': {
    verb: 'updated',
    icon: ShieldCheck,
    chip: 'bg-amber-50 text-amber-600',
  },
};

const FALLBACK = { verb: 'performed', icon: PenLine, chip: 'bg-slate-100 text-slate-500' };

/**
 * A short, human summary of what changed.
 *
 * The server stores a full diff; showing every field here would drown the feed,
 * so this names the first couple of fields and counts the rest.
 */
function summarise(entry: AuditEntry): string | null {
  const meta = entry.metadata;
  if (!meta) return null;

  const changes = meta.changes as Record<string, unknown> | unknown[] | null | undefined;

  if (Array.isArray(changes)) {
    // Feature-gate edits arrive as an array of {featureKey, from, to}.
    const names = changes
      .map((c) => (c && typeof c === 'object' ? String((c as { featureKey?: string }).featureKey ?? '') : ''))
      .filter(Boolean);
    if (names.length === 0) return null;
    return names.length <= 2
      ? names.map((n) => n.replace(/[_-]/g, ' ')).join(', ')
      : `${names.slice(0, 2).map((n) => n.replace(/[_-]/g, ' ')).join(', ')} +${names.length - 2} more`;
  }

  if (changes && typeof changes === 'object') {
    const keys = Object.keys(changes);
    if (keys.length === 0) return null;
    const readable = keys.map((k) => k.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
    return readable.length <= 2
      ? readable.join(' and ')
      : `${readable.slice(0, 2).join(', ')} +${readable.length - 2} more`;
  }

  const from = meta.from as { tier?: string } | undefined;
  const to = meta.to as { tier?: string } | undefined;
  if (from?.tier && to?.tier && from.tier !== to.tier) {
    return `${from.tier.replace(/_/g, ' ')} → ${to.tier.replace(/_/g, ' ')}`;
  }

  return null;
}

export function AuditFeed({
  entries,
  loading,
  error,
  limit,
  emptyBody = 'Deletions, project edits and settings changes will appear here.',
}: {
  entries: AuditEntry[];
  loading?: boolean;
  error?: string;
  limit?: number;
  emptyBody?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Could not load activity" body={error} icon={ShieldCheck} />;
  }

  const shown = limit ? entries.slice(0, limit) : entries;

  if (shown.length === 0) {
    return <EmptyState title="No admin activity yet" body={emptyBody} icon={ShieldCheck} />;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {shown.map((entry) => {
        const meta = ACTION_META[entry.action] ?? FALLBACK;
        const detail = summarise(entry);
        const actorName = entry.actor?.name ?? entry.actorEmail ?? 'A deleted admin';

        return (
          <li key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
              <meta.icon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-slate-700">
                <span className="font-medium text-slate-900">{actorName}</span> {meta.verb}{' '}
                <span className="font-medium text-slate-900">
                  {entry.targetLabel ?? entry.targetType}
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {detail ? `${detail} · ` : ''}
                {formatRelative(entry.createdAt)}
              </p>
            </div>

            <Avatar
              name={actorName}
              seed={entry.actorId ?? entry.actorEmail}
              size="sm"
              className="hidden sm:flex"
            />
          </li>
        );
      })}
    </ul>
  );
}
