import type { Project } from '../../data/projects';
import type { AdminTransaction, MembershipApplicationRow } from './types';

/**
 * "What is waiting on me?" — computed once, read by three surfaces.
 *
 * The topbar bell, the Overview action panel and the rail badges all have to
 * agree; when these rules lived inline in Overview.tsx there was nowhere else
 * to read them from, so any second surface would have had to restate (and
 * eventually contradict) them.
 */

export type QueueItem = {
  id: string;
  kind: 'project-overdue' | 'transaction-pending' | 'application-pending';
  label: string;
  detail: string;
  /** Section route, pre-filtered where the section supports it. */
  to: string;
  /** Sort weight — lower surfaces first. */
  priority: number;
};

/** Open projects whose funding deadline has already passed. */
export function overdueProjects(projects: Project[], now = Date.now()): Project[] {
  return projects.filter(
    (p) => p.status === 'open' && new Date(p.fundingDeadline).getTime() < now
  );
}

export function pendingTransactions(transactions: AdminTransaction[]): AdminTransaction[] {
  return transactions.filter((t) => t.status === 'pending');
}

export function pendingApplications(
  applications: MembershipApplicationRow[]
): MembershipApplicationRow[] {
  return applications.filter((a) => a.status === 'pending');
}

/**
 * The flattened queue, most urgent first.
 *
 * Overdue projects lead because they are the only item where inaction has a
 * deadline that has already been missed; pending money follows; membership
 * reviews last.
 */
export function buildQueue({
  projects,
  transactions,
  applications,
  now = Date.now(),
}: {
  projects: Project[];
  transactions: AdminTransaction[];
  applications: MembershipApplicationRow[];
  now?: number;
}): QueueItem[] {
  const items: QueueItem[] = [];

  for (const p of overdueProjects(projects, now)) {
    const daysLate = Math.max(
      1,
      Math.round((now - new Date(p.fundingDeadline).getTime()) / 86_400_000)
    );
    items.push({
      id: `project-${p.id}`,
      kind: 'project-overdue',
      label: p.title,
      detail: `Deadline passed ${daysLate} day${daysLate === 1 ? '' : 's'} ago — still open`,
      to: '/admin/projects?f=open',
      priority: 0,
    });
  }

  const pendingTx = pendingTransactions(transactions);
  for (const t of pendingTx) {
    items.push({
      id: `transaction-${t.id}`,
      kind: 'transaction-pending',
      label: t.user?.name ?? 'Unknown investor',
      detail: `${t.type.toLowerCase()} awaiting settlement`,
      to: '/admin/transactions?f=pending',
      priority: 1,
    });
  }

  for (const a of pendingApplications(applications)) {
    items.push({
      id: `application-${a.id}`,
      kind: 'application-pending',
      label: a.user?.name ?? 'Unknown applicant',
      detail: 'Membership application awaiting review',
      to: '/admin/memberships',
      priority: 2,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}
