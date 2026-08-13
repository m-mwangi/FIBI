import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, Bell, CalendarClock, CheckCircle2, Wallet } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useAdminData } from '../lib/AdminDataContext';
import { buildQueue, type QueueItem } from '../lib/queue';

/**
 * The topbar's "what needs me" bell.
 *
 * Reads the same `buildQueue` the Overview panel renders, so the badge count
 * and the dashboard can never disagree.
 */

const KIND_STYLE: Record<QueueItem['kind'], { icon: typeof Bell; chip: string }> = {
  'project-overdue': { icon: CalendarClock, chip: 'bg-amber-50 text-amber-600' },
  'transaction-pending': { icon: Wallet, chip: 'bg-sky-50 text-sky-600' },
  'application-pending': { icon: BadgeCheck, chip: 'bg-violet-50 text-violet-600' },
};

const VISIBLE_LIMIT = 8;

export function ActionQueue() {
  const { projects, transactions, applications } = useAdminData();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      buildQueue({
        projects: projects.data,
        transactions: transactions.data,
        applications: applications.data,
      }),
    [projects.data, transactions.data, applications.data]
  );

  const shown = items.slice(0, VISIBLE_LIMIT);
  const overflow = items.length - shown.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Action queue, ${items.length} item${items.length === 1 ? '' : 's'}`}
          className="adm-focus relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell className="h-[18px] w-[18px]" />
          {items.length > 0 && (
            <span className="adm-num absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.625rem] font-bold text-white ring-2 ring-white">
              {items.length > 99 ? '99+' : items.length}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[22rem] rounded-2xl border-[var(--adm-line)] p-0 shadow-[var(--adm-e3)]"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Needs attention</p>
          <span className="adm-num rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
            {items.length}
          </span>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-9 text-center">
            <CheckCircle2 className="mb-2 h-7 w-7 text-emerald-500" />
            <p className="text-sm font-medium text-slate-700">All clear</p>
            <p className="mt-0.5 text-sm text-slate-500">
              No overdue projects, pending money or waiting applications.
            </p>
          </div>
        ) : (
          <ul className="max-h-[22rem] overflow-y-auto py-1">
            {shown.map((item) => {
              const style = KIND_STYLE[item.kind];
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="group flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.chip}`}
                    >
                      <style.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs capitalize text-slate-500">
                        {item.detail}
                      </span>
                    </span>
                    <ArrowRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {overflow > 0 && (
          <footer className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              +{overflow} more on the dashboard
            </Link>
          </footer>
        )}
      </PopoverContent>
    </Popover>
  );
}
