import { INSIGHTS } from '../content/insights';
import { LEGAL_DRAFT } from '../pages/legal/draft';

/**
 * The crawlable surface of the site, in one place.
 *
 * Both the prerenderer and the sitemap generator read from here, but they want
 * different subsets — a `noindex` page still needs prerendering so a crawler
 * can *see* the noindex, while including it in the sitemap would be a
 * contradictory instruction. `indexable` draws that line.
 */

export type PublicRoute = {
  path: string;
  /** Sitemap hint. Omitted from the sitemap entirely when false. */
  indexable: boolean;
  /** Relative weight within this site only; has no cross-site meaning. */
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** ISO date, where the content has a known review date. */
  lastmod?: string;
};

/** Routes whose content ships in the bundle and never varies by API state. */
export const STATIC_PUBLIC_ROUTES: PublicRoute[] = [
  { path: '/', indexable: true, priority: 1.0, changefreq: 'weekly' },
  { path: '/projects', indexable: true, priority: 0.9, changefreq: 'daily' },
  { path: '/membership', indexable: true, priority: 0.8, changefreq: 'monthly' },
  { path: '/how-it-works', indexable: true, priority: 0.8, changefreq: 'monthly', lastmod: '2026-08-17' },
  { path: '/about', indexable: true, priority: 0.7, changefreq: 'monthly', lastmod: '2026-08-17' },
  { path: '/faq', indexable: true, priority: 0.7, changefreq: 'monthly', lastmod: '2026-08-17' },
  { path: '/insights', indexable: true, priority: 0.7, changefreq: 'weekly' },
  { path: '/contact', indexable: true, priority: 0.6, changefreq: 'yearly', lastmod: '2026-08-17' },
  {
    path: '/legal/risk-disclosure',
    indexable: true,
    priority: 0.5,
    changefreq: 'yearly',
    lastmod: '2026-08-17',
  },

  // Prerendered so crawlers receive the `noindex`, but kept out of the sitemap
  // while they are unsigned skeletons. Both flip together via LEGAL_DRAFT.
  { path: '/legal/terms', indexable: !LEGAL_DRAFT, priority: 0.3, changefreq: 'yearly' },
  { path: '/legal/privacy', indexable: !LEGAL_DRAFT, priority: 0.3, changefreq: 'yearly' },
];

/** One route per published guide. */
export const insightRoutes = (): PublicRoute[] =>
  INSIGHTS.map((i) => ({
    path: `/insights/${i.slug}`,
    indexable: true,
    priority: 0.6,
    changefreq: 'monthly' as const,
    lastmod: i.updated,
  }));

/**
 * Everything prerenderable without hitting the API.
 *
 * Project detail pages are appended at build time from the live projects
 * endpoint — see `scripts/prerender.mjs`. They are not listed here because
 * this module must stay importable from the browser bundle.
 */
export const buildTimeRoutes = (): PublicRoute[] => [
  ...STATIC_PUBLIC_ROUTES,
  ...insightRoutes(),
];

/**
 * Authenticated and utility routes.
 *
 * Listed explicitly so `robots.txt` and the `noindex` audit have a single
 * source. These are never prerendered: they render nothing meaningful without
 * a session, and a prerendered shell of a dashboard is exactly the thin
 * content that drags a domain's overall quality assessment down.
 */
export const PRIVATE_ROUTE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/member-hub',
  '/membership/apply',
  '/membership/billing',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];
