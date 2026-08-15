import { Link, useNavigate } from 'react-router';
import {
  BadgeCheck,
  ChevronDown,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMembership } from '../../context/MembershipContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { memberStatus, STATUS_TONE_ON_LIGHT } from './member-status';
import './portal.css';

/**
 * The signed-in identity control, shared by the portal bar and the marketing
 * nav so a member sees the same account surface on either.
 *
 * It replaced an outline button that rendered white-on-white over the
 * transparent hero nav — the control was there, but the name inside it was
 * invisible. Every tone below therefore sets its own background AND its own
 * text colour rather than inheriting either from the bar behind it.
 */

const TINTS = [
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-fuchsia-500',
  'from-rose-400 to-pink-500',
  'from-teal-400 to-cyan-500',
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Stable per-account tint, so the same person keeps the same colour. */
function tint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function MemberAvatar({
  name,
  seed,
  size = 'md',
  className = '',
}: {
  name: string;
  seed?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims =
    size === 'sm'
      ? 'h-8 w-8 text-[0.6875rem]'
      : size === 'lg'
      ? 'h-11 w-11 text-sm'
      : 'h-9 w-9 text-xs';
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${dims} ${tint(
        seed || name
      )} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

export type AccountMenuTone = 'onDark' | 'onLight';

export function AccountMenu({
  tone = 'onDark',
  /** Hide the name/tier column — used where the bar is tight. */
  compact = false,
}: {
  tone?: AccountMenuTone;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { membership, stage } = useMembership();

  if (!user) return null;

  const status = memberStatus(membership, stage);
  const isAdmin = user.role === 'admin';
  const isMember = stage === 'active' || stage === 'ending';

  const handleLogout = () => {
    void logout().then(() => navigate('/', { replace: true }));
  };

  const trigger =
    tone === 'onDark'
      // backdrop-blur so the chip stays legible when the marketing nav floats it
      // over an unknown hero image.
      ? 'border-white/15 bg-white/12 text-white backdrop-blur-sm hover:bg-white/20'
      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50';
  const triggerSub = tone === 'onDark' ? 'text-emerald-200/80' : 'text-slate-500';
  const triggerChevron = tone === 'onDark' ? 'text-white/50' : 'text-slate-400';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={`inv-focus flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-2 transition-colors sm:pr-3 ${trigger}`}
        >
          <MemberAvatar name={user.name} seed={user.id} size="sm" />
          {!compact && (
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-[9rem] truncate text-sm font-medium leading-tight">
                {user.name}
              </span>
              <span className={`block max-w-[9rem] truncate text-[0.6875rem] leading-tight ${triggerSub}`}>
                {isAdmin ? 'Administrator' : status.label}
              </span>
            </span>
          )}
          <ChevronDown className={`hidden h-4 w-4 shrink-0 sm:block ${triggerChevron}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-72 rounded-2xl p-0">
        {/* Identity. The email is here rather than in the bar — it is what a
            member checks when they are unsure which account they are in, and
            nothing else needs the space it would take up outside. */}
        <div className="flex items-center gap-3 px-3 py-3">
          <MemberAvatar name={user.name} seed={user.id} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* Standing. Shown to investors only: an admin has no membership to
            report, and a row reading "Not a member" under an operator account
            is noise. */}
        {!isAdmin && (
          <div className="border-y border-slate-100 bg-slate-50/70 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                  STATUS_TONE_ON_LIGHT[status.tone]
                }`}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {status.label}
              </span>
              {status.action && (
                <Link
                  to={status.action.to}
                  className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                >
                  {status.action.label}
                </Link>
              )}
            </div>
            <p className="inv-num mt-1.5 text-xs text-slate-500">{status.detail}</p>
          </div>
        )}

        <div className="p-1.5">
          {isAdmin ? (
            <DropdownMenuItem asChild>
              <Link to="/admin">
                <LayoutDashboard className="h-4 w-4" /> Admin console
              </Link>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" /> Portfolio
                </Link>
              </DropdownMenuItem>
              {isMember && (
                <DropdownMenuItem asChild>
                  <Link to="/member-hub">
                    <Sparkles className="h-4 w-4" /> Member hub
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/membership/billing">
                  <CreditCard className="h-4 w-4" /> Membership &amp; billing
                </Link>
              </DropdownMenuItem>
              {/* The settings dialog lives on the portfolio page, so this hands
                  the page a hash to open it rather than duplicating the form. */}
              <DropdownMenuItem asChild>
                <Link to="/dashboard#settings">
                  <Settings className="h-4 w-4" /> Account settings
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/">
              <ExternalLink className="h-4 w-4" /> Public site
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
            <LogOut className="h-4 w-4" /> Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
