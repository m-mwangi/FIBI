/**
 * Head-tag plumbing shared by the client and the build-time prerenderer.
 *
 * Two consumers, two very different mechanics:
 *
 *  - **Prerender (node).** `renderToString` never runs effects, so `<Seo>`
 *    writes its resolved data into a module-level sink *during render* and
 *    `scripts/prerender.mjs` reads it back out afterwards to build the static
 *    `<head>`. This is the same trick react-helmet uses; it is safe here only
 *    because each prerendered page is a single synchronous render pass that
 *    calls `resetSeoSink()` first.
 *
 *  - **Browser.** The prerendered `<head>` is correct for the entry URL only.
 *    A client-side route change has to mutate the live document, so `<Seo>`
 *    applies the same data through `applySeoToDocument` in an effect.
 *
 * Keep this file free of JSX and of browser globals at module scope — node
 * imports it directly.
 */

export type SeoData = {
  title: string;
  description: string;
  /** Absolute URL. Self-referencing on every indexable page. */
  canonical: string;
  image: string;
  /** Emits `noindex, nofollow`. Use on every authenticated or thin surface. */
  noindex: boolean;
  type: 'website' | 'article' | 'profile';
  /** JSON-LD objects, serialised one `<script>` per entry. */
  jsonLd: unknown[];
};

/** Node has no `window`; Vite's SSR build keeps this branch statically resolvable. */
export const isServer = typeof window === 'undefined';

let sink: SeoData | null = null;

/** Call before each prerender pass so pages cannot inherit each other's head. */
export function resetSeoSink(): void {
  sink = null;
}

export function collectSeo(data: SeoData): void {
  sink = data;
}

export function readSeoSink(): SeoData | null {
  return sink;
}

/** Escapes text destined for an HTML attribute or text node. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * `</script>` inside JSON-LD would close the surrounding script element early.
 * Escaping the slash keeps the JSON valid while making the sequence inert.
 */
function escapeJsonLd(value: string): string {
  return value.replace(/</g, '\\u003c');
}

/**
 * Serialises head tags for the prerendered HTML.
 *
 * Ordering matters for readability only, but `<title>` stays first because
 * some crawlers cap how much of `<head>` they parse.
 */
export function renderSeoToHtml(data: SeoData, siteName: string, locale: string): string {
  const tags: string[] = [];
  const esc = escapeHtml;

  tags.push(`<title>${esc(data.title)}</title>`);
  tags.push(`<meta name="description" content="${esc(data.description)}" />`);

  // A noindex page still gets a canonical omitted rather than pointing
  // elsewhere: telling Google "don't index me" and "credit that other URL"
  // at once is contradictory and one of the two gets ignored unpredictably.
  if (data.noindex) {
    tags.push(`<meta name="robots" content="noindex, nofollow" />`);
  } else {
    tags.push(`<meta name="robots" content="index, follow, max-image-preview:large" />`);
    tags.push(`<link rel="canonical" href="${esc(data.canonical)}" />`);
  }

  tags.push(`<meta property="og:type" content="${esc(data.type)}" />`);
  tags.push(`<meta property="og:site_name" content="${esc(siteName)}" />`);
  tags.push(`<meta property="og:locale" content="${esc(locale)}" />`);
  tags.push(`<meta property="og:title" content="${esc(data.title)}" />`);
  tags.push(`<meta property="og:description" content="${esc(data.description)}" />`);
  tags.push(`<meta property="og:url" content="${esc(data.canonical)}" />`);
  if (data.image) tags.push(`<meta property="og:image" content="${esc(data.image)}" />`);

  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:title" content="${esc(data.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${esc(data.description)}" />`);
  if (data.image) tags.push(`<meta name="twitter:image" content="${esc(data.image)}" />`);

  for (const block of data.jsonLd) {
    const json = escapeJsonLd(JSON.stringify(block));
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }

  return tags.join('\n    ');
}

/** Marks every tag this module owns so client updates can replace cleanly. */
const MANAGED = 'data-seo-managed';

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(MANAGED, '');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/**
 * Applies `data` to the live document on client-side navigation.
 *
 * Tags emitted by the prerenderer carry no `data-seo-managed` attribute, so
 * they are matched by name/property and updated in place rather than
 * duplicated — the crawler-visible head and the runtime head stay in sync.
 */
export function applySeoToDocument(data: SeoData, siteName: string, locale: string): void {
  document.title = data.title;

  upsertMeta('meta[name="description"]', { name: 'description', content: data.description });
  upsertMeta('meta[name="robots"]', {
    name: 'robots',
    content: data.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  });

  const og: Array<[string, string]> = [
    ['og:type', data.type],
    ['og:site_name', siteName],
    ['og:locale', locale],
    ['og:title', data.title],
    ['og:description', data.description],
    ['og:url', data.canonical],
  ];
  if (data.image) og.push(['og:image', data.image]);
  for (const [property, content] of og) {
    upsertMeta(`meta[property="${property}"]`, { property, content });
  }

  const tw: Array<[string, string]> = [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', data.title],
    ['twitter:description', data.description],
  ];
  if (data.image) tw.push(['twitter:image', data.image]);
  for (const [name, content] of tw) {
    upsertMeta(`meta[name="${name}"]`, { name, content });
  }

  // Canonical is removed rather than left stale on a noindex page.
  const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (data.noindex) {
    existingCanonical?.remove();
  } else if (existingCanonical) {
    existingCanonical.href = data.canonical;
  } else {
    const link = document.createElement('link');
    link.setAttribute(MANAGED, '');
    link.rel = 'canonical';
    link.href = data.canonical;
    document.head.appendChild(link);
  }

  // JSON-LD is fully replaced: merging blocks across routes would leave a
  // project's schema attached to whatever page the user navigated to next.
  document.head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((node) => node.remove());
  for (const block of data.jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(MANAGED, '');
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  }
}
