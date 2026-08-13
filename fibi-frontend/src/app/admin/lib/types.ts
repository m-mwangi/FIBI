/** Shared shapes for the admin portal. Mirrors what the BACKEND admin endpoints return. */

export type AdminTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'PAYOUT';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  user: { name: string; email: string } | null;
};

/**
 * GET /api/v1/investments/all returns raw Prisma `Investment` rows, so these
 * field names have to match the schema exactly.
 *
 * They previously did not: this type declared `amount` and `createdAt`, but the
 * columns are `amountInvested` and `investmentDate`. Every read was therefore
 * `undefined`, and the Users drawer's "Invested" total silently rendered $0 for
 * every account.
 */
export type AdminInvestment = {
  id: string;
  userId: string;
  projectId: string;
  amountInvested: number;
  currentValue: number | null;
  totalReturns: number | null;
  status: 'pending' | 'active' | 'completed';
  investmentDate: string;
  user: { name: string; email: string } | null;
  project: { title: string } | null;
};

export type MembershipApplicationRow = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; role: string };
  motivation: string;
  interests: string;
  communityContribution: string;
  status: string;
  adminFeedback: string | null;
  createdAt: string;
};

export type MembershipRow = {
  tier: string;
  status: string;
  applicationStatus: string;
  renewalDate: string | null;
  badgeLabel: string | null;
  userId: string;
  user: { id: string; name: string; email: string; role: string };
};

export type FeatureRow = { featureKey: string; minTier: string };

export type GlobalSettingsDTO = {
  id: string;
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  minInvestment: number;
  maxInvestment: number;
  platformFee: number;
  currency: string;
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  transactionFee: number;
  emailNotifications: boolean;
  investmentEmails: boolean;
  adminAlerts: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
};

/** One entry from the admin audit trail — GET /api/v1/admin/audit. */
export type AuditEntry = {
  id: string;
  actorId: string | null;
  /** Denormalised on the server so history survives the actor's deletion. */
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
};

export type AuditResponse = {
  success: boolean;
  count: number;
  nextCursor: string | null;
  entries: AuditEntry[];
};

export const SETTINGS_API = '/api/v1/settings';
export const PROJECTS_API = '/api/v1/projects';
export const TRANSACTIONS_ALL_API = '/api/v1/transactions/all';
export const INVESTMENTS_ALL_API = '/api/v1/investments/all';
export const AUDIT_API = '/api/v1/admin/audit';
export const MEMBERSHIP_APPLICATIONS_API = '/api/v1/membership/admin/applications';
