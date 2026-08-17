import { getApiBase } from '@/lib/api';
import type { Project } from '@/app/data/projects';

export type ApiProjectImage = {
  id: string;
  imageUrl: string;
  projectId: string;
  createdAt: string;
};

export type ApiTimelinePhase = {
  id: string;
  phase: string;
  status: string;
  projectId: string;
};

/** Raw project from GET /api/v1/projects */
export type ApiProject = {
  id: string;
  title: string;
  location: string;
  category: string;
  minInvestmentMinor: number;
  totalFundingMinor: number;
  currentFundingMinor: number;
  currency: string;
  investorsCount: number;
  projectedROI: number;
  payoutFrequency: string;
  fundingDeadline: string;
  description: string;
  features: string[];
  imageUrl: string;
  status: string;
  timeline: ApiTimelinePhase[];
  projectImages?: ApiProjectImage[];
};

export function resolveMediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return '';
  const s = pathOrUrl.trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const base = getApiBase().replace(/\/$/, '');
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${base}${path}`;
}

function dedupeUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

function mapTimelineStatus(status: string): 'completed' | 'in-progress' | 'upcoming' {
  if (status === 'in_progress' || status === 'in-progress') return 'in-progress';
  if (status === 'completed') return 'completed';
  return 'upcoming';
}

function mapProjectStatus(status: string): Project['status'] {
  if (status === 'open' || status === 'funded' || status === 'active' || status === 'closed') {
    return status;
  }
  return 'open';
}

/** Merge cover + ProjectImage rows into ordered unique gallery URLs (absolute). */
/**
 * Display names for project categories.
 *
 * Categories are free-form strings set by admins, so this map will always
 * trail the data. `categoryLabel` humanises anything missing rather than
 * falling through to the raw value — an unmapped slug used to reach the page
 * `<title>` verbatim ("bulk-parcel project in Msambweni"), which is what a
 * searcher would have seen in the results.
 */
const CATEGORY_LABELS: Record<string, string> = {
  'eco-lodge': 'Eco lodge',
  'solar-roof': 'Solar roof',
  agriculture: 'Agriculture',
  'bulk-parcel': 'Bulk parcel',
  'coastal-beach': 'Coastal beach',
};

export function categoryLabel(category: string): string {
  const known = CATEGORY_LABELS[category];
  if (known) return known;

  const cleaned = category.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return category;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function normalizeApiProject(raw: ApiProject): Project {
  const primaryRaw = raw.imageUrl || '';
  const fromRows = (raw.projectImages ?? []).map((r) => r.imageUrl);
  const orderedRaw = dedupeUrls([primaryRaw, ...fromRows]);

  const images = orderedRaw.map((url) => resolveMediaUrl(url));
  const imageUrl = resolveMediaUrl(primaryRaw) || images[0] || '';

  const deadline =
    typeof raw.fundingDeadline === 'string'
      ? raw.fundingDeadline
      : new Date(raw.fundingDeadline).toISOString();

  return {
    id: raw.id,
    title: raw.title,
    location: raw.location,
    category: raw.category,
    minInvestmentMinor: Number(raw.minInvestmentMinor),
    totalFundingMinor: Number(raw.totalFundingMinor),
    currentFundingMinor: Number(raw.currentFundingMinor),
    currency: raw.currency || 'USD',
    investors: Number(raw.investorsCount ?? 0),
    projectedROI: Number(raw.projectedROI),
    payoutFrequency: raw.payoutFrequency,
    fundingDeadline: deadline,
    description: raw.description ?? '',
    features: Array.isArray(raw.features) ? raw.features : [],
    imageUrl,
    images: images.length > 0 ? images : imageUrl ? [imageUrl] : [],
    status: mapProjectStatus(raw.status),
    timeline: (raw.timeline ?? []).map((t) => ({
      phase: t.phase,
      status: mapTimelineStatus(t.status),
    })),
  };
}

export type ProjectListResponse = { projects: ApiProject[] };
export type ProjectOneResponse = { project: ApiProject };
export type ProjectCreateResponse = { message?: string; project: ApiProject };
export type ProjectUpdateResponse = { message?: string; project: ApiProject };
