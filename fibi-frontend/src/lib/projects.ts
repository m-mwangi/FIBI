import { getApiBase } from '@/lib/api';
import type { Project, ProjectLink } from '@/app/data/projects';

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

/** A linked project as the API summarises it — see LINKED_PROJECT_SUMMARY. */
export type ApiProjectLink = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  imageUrl: string;
  currency: string;
  minInvestmentMinor: number;
  totalFundingMinor: number;
  currentFundingMinor: number;
  projectedROI: number;
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
  parentId?: string | null;
  parent?: ApiProjectLink | null;
  components?: ApiProjectLink[];
};

/**
 * Absolute URL for a stored image path.
 *
 * Only `/uploads/...` lives on the API host — that is where multer writes and
 * where Express serves from. Everything else (`/images/...`) is a static asset
 * of this frontend, so it stays relative and resolves against whatever origin
 * is serving the page. In production the two are the same origin behind nginx
 * and the distinction is invisible; in local development it is the difference
 * between an image and a broken one, because the dev server on :5173 holds the
 * static files and the API on :5000 does not.
 */
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return '';
  const s = pathOrUrl.trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const path = s.startsWith('/') ? s : `/${s}`;
  if (!path.startsWith('/uploads/')) return path;
  const base = getApiBase().replace(/\/$/, '');
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
  'master-plan': 'Master plan',
  residential: 'Residential',
  'estate-lots': 'Estate lots',
  equestrian: 'Equestrian',
  entertainment: 'Entertainment',
  'sports-leisure': 'Sports & leisure',
  'eco-infrastructure': 'Eco infrastructure',
};

export function categoryLabel(category: string): string {
  const known = CATEGORY_LABELS[category];
  if (known) return known;

  const cleaned = category.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return category;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function normalizeApiProjectLink(raw: ApiProjectLink): ProjectLink {
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    location: raw.location,
    status: raw.status,
    imageUrl: resolveMediaUrl(raw.imageUrl),
    currency: raw.currency || 'USD',
    minInvestmentMinor: Number(raw.minInvestmentMinor ?? 0),
    totalFundingMinor: Number(raw.totalFundingMinor ?? 0),
    currentFundingMinor: Number(raw.currentFundingMinor ?? 0),
    projectedROI: Number(raw.projectedROI ?? 0),
  };
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
    parentId: raw.parentId ?? null,
    parent: raw.parent ? normalizeApiProjectLink(raw.parent) : null,
    components: (raw.components ?? []).map(normalizeApiProjectLink),
  };
}

export type ProjectListResponse = { projects: ApiProject[] };
export type ProjectOneResponse = { project: ApiProject };
export type ProjectCreateResponse = { message?: string; project: ApiProject };
export type ProjectUpdateResponse = { message?: string; project: ApiProject };
