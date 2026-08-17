import { useEffect } from 'react';
import {
  applySeoToDocument,
  collectSeo,
  isServer,
  type SeoData,
} from './seoStore';
import {
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  TITLE_SUFFIX,
} from './config';

export type SeoProps = {
  /**
   * Page title without the brand suffix. Aim for under ~50 characters so the
   * suffix still fits inside Google's ~60 character cut-off.
   */
  title: string;
  description?: string;
  /**
   * Route path (`/projects`) or absolute URL. Resolved against `SITE_URL`.
   * Every indexable page must set this — a missing canonical on an SPA is how
   * query-string variants end up indexed as duplicates.
   */
  path: string;
  image?: string;
  noindex?: boolean;
  type?: SeoData['type'];
  jsonLd?: unknown[];
  /** Skips the ` | FIBI` suffix, for titles that already carry the brand. */
  bareTitle?: boolean;
};

function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  // The homepage keeps its trailing slash; every other path drops it, so
  // `/projects` and `/projects/` cannot both be canonical.
  const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
  return `${SITE_URL}${normalized}`;
}

/**
 * Declares the head for one route. Render at most one per page — the last
 * one to render wins, both in the SSR sink and in the DOM.
 *
 * Renders nothing. On the server it records into the prerender sink; in the
 * browser it mutates `document.head` after paint.
 */
export function Seo({
  title,
  description = SITE_TAGLINE,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = 'website',
  jsonLd = [],
  bareTitle = false,
}: SeoProps) {
  const data: SeoData = {
    title: bareTitle ? title : `${title}${TITLE_SUFFIX}`,
    description,
    canonical: absolute(path),
    image,
    noindex,
    type,
    jsonLd,
  };

  // Render-phase write, deliberately. Effects never fire under
  // `renderToString`, so this is the only hook the prerenderer gets. Harmless
  // in the browser, where the effect below is what actually takes effect.
  if (isServer) collectSeo(data);

  // Serialised so a new array literal from the caller on every render does not
  // retrigger the effect — only a genuine content change does.
  const fingerprint = JSON.stringify(data);

  useEffect(() => {
    applySeoToDocument(JSON.parse(fingerprint) as SeoData, SITE_NAME, DEFAULT_LOCALE);
  }, [fingerprint]);

  return null;
}

/** Head for authenticated and utility routes: keeps them out of the index. */
export function NoIndexSeo({ title, path }: { title: string; path: string }) {
  return <Seo title={title} path={path} noindex description={SITE_TAGLINE} />;
}
