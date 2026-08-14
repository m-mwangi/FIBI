import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Inbox, type LucideIcon } from 'lucide-react';
import { fundingPercent } from '../lib/format';
import { Sparkline } from './Sparkline';

/**
 * The admin console's shared vocabulary.
 *
 * Every section composes from this file, so a spacing or colour decision is
 * made once here rather than re-typed into seven pages.
 */

/* ------------------------------------------------------------------ header */

/** Page title, optional eyebrow/description, and right-aligned actions. */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  /** Rendered under the header — segmented controls, tabs, filter rows. */
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 sm:mb-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/* --------------------------------------------------------------------- KPI */

const STAT_TONES = {
  brand: { chip: 'bg-emerald-50 text-emerald-600', spark: '#059669' },
  sky: { chip: 'bg-sky-50 text-sky-600', spark: '#0284c7' },
  violet: { chip: 'bg-violet-50 text-violet-600', spark: '#7c3aed' },
  amber: { chip: 'bg-amber-50 text-amber-600', spark: '#d97706' },
  neutral: { chip: 'bg-slate-100 text-slate-500', spark: '#64748b' },
} as const;

export type StatTone = keyof typeof STAT_TONES;

/**
 * KPI tile.
 *
 * `delta` is nullable on purpose — with one month of history there is no honest
 * comparison to draw, and the tile omits the change rather than showing a
 * fabricated 0% or 100%. `series` is likewise optional: a tile with no real
 * series shows no sparkline instead of a decorative squiggle.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  series,
  tone = 'brand',
  loading,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  delta?: number | null;
  series?: number[];
  tone?: StatTone;
  loading?: boolean;
}) {
  const palette = STAT_TONES[tone];
  const showSpark = Array.isArray(series) && series.length > 1 && series.some((v) => v !== 0);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white p-5 shadow-[var(--adm-e1)] transition-shadow duration-200 hover:shadow-[var(--adm-e2)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${palette.chip}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      {loading ? (
        <div className="mt-3.5 h-8 w-28 animate-pulse rounded-md bg-slate-100" />
      ) : (
        <p className="adm-num mt-3.5 text-[1.75rem] font-bold leading-none text-slate-900">{value}</p>
      )}

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Trend value={delta} />
          {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
        </div>
        {showSpark && !loading && (
          <Sparkline values={series!} color={palette.spark} width={72} height={26} className="shrink-0" />
        )}
      </div>
    </div>
  );
}

/** Percentage-change chip. Renders nothing when there is no honest baseline. */
export function Trend({ value, suffix = '' }: { value?: number | null; suffix?: string }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const positive = value >= 0;
  return (
    <span
      className={`adm-num inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(0)}%{suffix}
    </span>
  );
}

/* ------------------------------------------------------------------- panel */

/** Card wrapper used by every panel so spacing and borders stay consistent. */
export function Panel({
  title,
  description,
  actions,
  footer,
  children,
  padded = true,
  className = '',
}: {
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Set false when the child is a table that should reach the panel edges. */
  padded?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white shadow-[var(--adm-e1)] ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="font-semibold tracking-[-0.01em] text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
      {footer && <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">{footer}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ status */

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  // Projects
  open: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  funded: { pill: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  active: { pill: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  closed: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  // Transactions / applications
  completed: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  approved: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  paid: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  pending: { pill: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  failed: { pill: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  rejected: { pill: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  expired: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  canceled: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  none: { pill: 'bg-slate-100 text-slate-500 ring-slate-200', dot: 'bg-slate-300' },
  // Roles
  admin: { pill: 'bg-indigo-50 text-indigo-700 ring-indigo-200', dot: 'bg-indigo-500' },
  investor: { pill: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  // Membership tiers
  free: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  basic: { pill: 'bg-teal-50 text-teal-700 ring-teal-200', dot: 'bg-teal-500' },
  premium: { pill: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  investor_plus: { pill: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
};

const FALLBACK_STATUS = { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' };

/** Colour-coded status pill with a leading dot. */
export function StatusPill({ status, className = '' }: { status: string; className?: string }) {
  const key = String(status || '').toLowerCase();
  const styles = STATUS_STYLES[key] ?? FALLBACK_STATUS;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${styles.pill} ${className}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
      {String(status || '—').replace(/[_-]/g, ' ')}
    </span>
  );
}

/* ----------------------------------------------------------------- funding */

/** Funding progress as a bar with its percentage. */
export function FundingBar({
  current,
  total,
  showLabel = true,
}: {
  current: number;
  total: number;
  showLabel?: boolean;
}) {
  const pct = fundingPercent(current, total);
  const complete = pct >= 100;

  return (
    <div className="min-w-[110px]">
      {showLabel && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="adm-num text-xs font-semibold text-slate-700">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${complete ? 'bg-sky-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Funding progress as a ring — used where a bar would not fit, e.g. on cards. */
export function Ring({
  current,
  total,
  size = 44,
  stroke = 4,
}: {
  current: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const pct = fundingPercent(current, total);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const complete = pct >= 100;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef1f5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={complete ? '#0284c7' : '#059669'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="adm-num absolute inset-0 flex items-center justify-center text-[0.7rem] font-bold text-slate-700">
        {pct.toFixed(0)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ inputs */

export type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
  count?: number;
};

/**
 * Segmented control. Replaces the three separate hand-rolled chip toggles the
 * old sections each defined inline.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[0.8125rem]';
  return (
    <div
      role="tablist"
      className={`inline-flex gap-0.5 rounded-xl border border-[var(--adm-line)] bg-white p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`adm-focus rounded-lg font-medium transition-colors ${pad} ${
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`adm-num ml-1.5 ${active ? 'text-white/60' : 'text-slate-400'}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ people */

/**
 * Avatar with a tint derived from the record id.
 *
 * Hashing the id rather than the name means the same person keeps the same
 * colour even after a rename, and two people called "John" are still
 * distinguishable at a glance.
 */
const AVATAR_TINTS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
];

export function avatarTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length]!;
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

export function Avatar({
  name,
  seed,
  size = 'md',
  className = '',
}: {
  name: string;
  /** Stable id to hash for the tint; falls back to the name. */
  seed?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims =
    size === 'sm' ? 'h-8 w-8 text-[0.6875rem]' : size === 'lg' ? 'h-12 w-12 text-sm' : 'h-9 w-9 text-xs';
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${avatarTint(
        seed || name
      )} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------- feedback */

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
export function EmptyChart({ message, height = 280 }: { message: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center"
      style={{ height }}
    >
      <p className="text-sm font-medium text-slate-600">Not enough data yet</p>
      <p className="mt-1 max-w-xs px-4 text-sm text-slate-400">{message}</p>
    </div>
  );
}

/** Generic empty state for lists and panels. */
export function EmptyState({
  title,
  body,
  icon: Icon = Inbox,
  action,
  className = '',
}: {
  title: string;
  body?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}>
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-400" />
      </span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Placeholder block that holds layout while data loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

/** Label/value row for detail panels and drawers. */
export function KeyValue({
  label,
  children,
  icon: Icon,
}: {
  label: string;
  children: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-medium text-slate-800">{children}</dd>
    </div>
  );
}
