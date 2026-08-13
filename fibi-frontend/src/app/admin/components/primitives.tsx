import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { fundingPercent } from '../lib/format';

/** Page title + optional description and right-aligned actions. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * KPI tile.
 *
 * `delta` is nullable on purpose — with one month of history there is no honest
 * comparison to draw, and the tile simply omits the change rather than showing
 * a fabricated 0% or 100%.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  loading,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  delta?: number | null;
  loading?: boolean;
}) {
  const showDelta = typeof delta === 'number' && Number.isFinite(delta);
  const positive = showDelta && delta! >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
          <Icon className="h-[18px] w-[18px] text-emerald-600" />
        </span>
      </div>

      {loading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      )}

      <div className="mt-1.5 flex items-center gap-2">
        {showDelta && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta!).toFixed(0)}%
          </span>
        )}
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

/** Card wrapper used by every panel so spacing and borders stay consistent. */
export function Panel({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h2 className="font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  // Projects
  open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  funded: 'bg-sky-50 text-sky-700 ring-sky-200',
  active: 'bg-violet-50 text-violet-700 ring-violet-200',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200',
  // Transactions / applications
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  expired: 'bg-slate-100 text-slate-600 ring-slate-200',
  canceled: 'bg-slate-100 text-slate-600 ring-slate-200',
  none: 'bg-slate-100 text-slate-500 ring-slate-200',
  // Roles
  admin: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  investor: 'bg-slate-100 text-slate-700 ring-slate-200',
};

/** Colour-coded status pill — replaces the old uniform black badge. */
export function StatusPill({ status }: { status: string }) {
  const key = String(status || '').toLowerCase();
  const styles = STATUS_STYLES[key] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${styles}`}
    >
      {String(status || '—').replace(/[_-]/g, ' ')}
    </span>
  );
}

/** Funding progress as a bar with its percentage — the old table showed bare text. */
export function FundingBar({ current, total }: { current: number; total: number }) {
  const pct = fundingPercent(current, total);
  const complete = pct >= 100;

  return (
    <div className="min-w-[120px]">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">{pct.toFixed(0)}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${complete ? 'bg-sky-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Inline banner for section-level success/failure messages. */
export function Flash({ type, children }: { type: 'ok' | 'err'; children: ReactNode }) {
  return (
    <div
      role="status"
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        type === 'ok'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      {children}
    </div>
  );
}

/** Shown in place of a chart when there is genuinely nothing to plot. */
export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
      <p className="text-sm font-medium text-slate-600">Not enough data yet</p>
      <p className="mt-1 max-w-xs text-sm text-slate-400">{message}</p>
    </div>
  );
}
