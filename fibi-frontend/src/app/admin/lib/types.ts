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

export type AdminInvestment = {
  id: string;
  userId: string;
  projectId: string;
  amount: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
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

export const SETTINGS_API = '/api/v1/settings';
export const PROJECTS_API = '/api/v1/projects';
export const TRANSACTIONS_ALL_API = '/api/v1/transactions/all';
export const INVESTMENTS_ALL_API = '/api/v1/investments/all';
