import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getJson } from '@/lib/api';
import { USERS_PREFIX, type UsersListResponse, type UserListEntry } from '@/lib/users';
import { normalizeApiProject, type ProjectListResponse } from '@/lib/projects';
import type { Project } from '../../data/projects';
import {
  AUDIT_API,
  INVESTMENTS_ALL_API,
  MEMBERSHIP_APPLICATIONS_API,
  PROJECTS_API,
  TRANSACTIONS_ALL_API,
  type AdminInvestment,
  type AdminTransaction,
  type AuditEntry,
  type AuditResponse,
  type MembershipApplicationRow,
} from './types';

/**
 * One fetch of the shared admin datasets, held for the whole portal.
 *
 * The previous dashboard re-fetched per section and kept four parallel
 * loading/error flags inline. Centralising it means the KPI row, the tables and
 * the charts all read the same numbers, and a section switch is instant.
 *
 * Each dataset carries its own error so one failing endpoint degrades a single
 * panel instead of blanking the portal — /transactions and /investments in
 * particular can fail independently of users and projects.
 */

export type Resource<T> = {
  data: T;
  loading: boolean;
  error: string;
};

type AdminData = {
  users: Resource<UserListEntry[]>;
  projects: Resource<Project[]>;
  transactions: Resource<AdminTransaction[]>;
  investments: Resource<AdminInvestment[]>;
  /** Membership applications live here, not only in the Memberships section,
   *  so the rail badge and the action queue can count pending reviews without
   *  that section being mounted. */
  applications: Resource<MembershipApplicationRow[]>;
  audit: Resource<AuditEntry[]>;
  /** When the last successful refreshAll completed — shown in the topbar. */
  lastSyncedAt: Date | null;
  refreshUsers: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  refreshAudit: () => Promise<void>;
  refreshAll: () => Promise<void>;
  /** Local mutations so a delete/create reflects instantly without a round trip. */
  setUsers: (updater: (prev: UserListEntry[]) => UserListEntry[]) => void;
  setProjects: (updater: (prev: Project[]) => Project[]) => void;
};

const AdminDataContext = createContext<AdminData | undefined>(undefined);

const emptyResource = <T,>(data: T): Resource<T> => ({ data, loading: true, error: '' });

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsersState] = useState<Resource<UserListEntry[]>>(emptyResource([]));
  const [projects, setProjectsState] = useState<Resource<Project[]>>(emptyResource([]));
  const [transactions, setTransactions] = useState<Resource<AdminTransaction[]>>(emptyResource([]));
  const [investments, setInvestments] = useState<Resource<AdminInvestment[]>>(emptyResource([]));
  const [applications, setApplications] = useState<Resource<MembershipApplicationRow[]>>(
    emptyResource([])
  );
  const [audit, setAudit] = useState<Resource<AuditEntry[]>>(emptyResource([]));
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const loadUsers = useCallback(async () => {
    setUsersState((r) => ({ ...r, loading: true, error: '' }));
    const res = await getJson<UsersListResponse>(USERS_PREFIX);
    setUsersState(
      res.ok
        ? { data: res.data.data ?? [], loading: false, error: '' }
        : { data: [], loading: false, error: res.error || 'Failed to load users.' }
    );
  }, []);

  const loadProjects = useCallback(async () => {
    setProjectsState((r) => ({ ...r, loading: true, error: '' }));
    const res = await getJson<ProjectListResponse>(PROJECTS_API);
    setProjectsState(
      res.ok
        ? { data: (res.data.projects ?? []).map(normalizeApiProject), loading: false, error: '' }
        : { data: [], loading: false, error: res.error || 'Failed to load projects.' }
    );
  }, []);

  const loadTransactions = useCallback(async () => {
    setTransactions((r) => ({ ...r, loading: true, error: '' }));
    const res = await getJson<{ transactions: AdminTransaction[] }>(TRANSACTIONS_ALL_API);
    setTransactions(
      res.ok
        ? { data: res.data.transactions ?? [], loading: false, error: '' }
        : { data: [], loading: false, error: res.error || 'Failed to load transactions.' }
    );
  }, []);

  const loadInvestments = useCallback(async () => {
    setInvestments((r) => ({ ...r, loading: true, error: '' }));
    const res = await getJson<{ investments: AdminInvestment[] }>(INVESTMENTS_ALL_API);
    setInvestments(
      res.ok
        ? { data: res.data.investments ?? [], loading: false, error: '' }
        : { data: [], loading: false, error: res.error || 'Failed to load investments.' }
    );
  }, []);

  const loadApplications = useCallback(async () => {
    setApplications((r) => ({ ...r, loading: true, error: '' }));
    const res = await getJson<{ success: boolean; applications: MembershipApplicationRow[] }>(
      MEMBERSHIP_APPLICATIONS_API
    );
    setApplications(
      res.ok
        ? { data: res.data.applications ?? [], loading: false, error: '' }
        : { data: [], loading: false, error: res.error || 'Failed to load applications.' }
    );
  }, []);

  const loadAudit = useCallback(async () => {
    setAudit((r) => ({ ...r, loading: true, error: '' }));
    const res = await getJson<AuditResponse>(`${AUDIT_API}?limit=50`);
    setAudit(
      res.ok
        ? { data: res.data.entries ?? [], loading: false, error: '' }
        : { data: [], loading: false, error: res.error || 'Failed to load activity.' }
    );
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadUsers(),
      loadProjects(),
      loadTransactions(),
      loadInvestments(),
      loadApplications(),
      loadAudit(),
    ]);
    setLastSyncedAt(new Date());
  }, [loadUsers, loadProjects, loadTransactions, loadInvestments, loadApplications, loadAudit]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const setUsers = useCallback((updater: (prev: UserListEntry[]) => UserListEntry[]) => {
    setUsersState((r) => ({ ...r, data: updater(r.data) }));
  }, []);

  const setProjects = useCallback((updater: (prev: Project[]) => Project[]) => {
    setProjectsState((r) => ({ ...r, data: updater(r.data) }));
  }, []);

  const value = useMemo<AdminData>(
    () => ({
      users,
      projects,
      transactions,
      investments,
      applications,
      audit,
      lastSyncedAt,
      refreshUsers: loadUsers,
      refreshProjects: loadProjects,
      refreshApplications: loadApplications,
      refreshAudit: loadAudit,
      refreshAll,
      setUsers,
      setProjects,
    }),
    [
      users,
      projects,
      transactions,
      investments,
      applications,
      audit,
      lastSyncedAt,
      loadUsers,
      loadProjects,
      loadApplications,
      loadAudit,
      refreshAll,
      setUsers,
      setProjects,
    ]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
  return ctx;
}
