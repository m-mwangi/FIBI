import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router';
import { routeConfig } from './app/routeConfig';
import { AuthProvider } from './app/context/AuthContext';
import { MembershipProvider } from './app/context/MembershipContext';
import {
  readSeoSink,
  renderSeoToHtml,
  resetSeoSink,
  type SeoData,
} from './app/seo/seoStore';
import { DEFAULT_LOCALE, SITE_NAME, SITE_URL } from './app/seo/config';
import {
  resetPrerenderPayload,
  serializePrerenderPayload,
  setPrerenderPayload,
} from './app/seo/prerenderData';
import { normalizeApiProject, type ApiProject } from './lib/projects';

/**
 * Re-exported so the prerender and sitemap scripts get the route list from the
 * same bundle they render with. Importing the source module separately would
 * let the two drift apart across a build.
 */
export {
  buildTimeRoutes,
  STATIC_PUBLIC_ROUTES,
  PRIVATE_ROUTE_PREFIXES,
} from './app/seo/publicRoutes';
export { SITE_URL } from './app/seo/config';

/**
 * Build-time server render. Never runs in production — `scripts/prerender.mjs`
 * imports it, writes static HTML, and the result is what nginx serves.
 *
 * The app is safe to render this way because every browser API it touches sits
 * inside an effect or an event handler, and `renderToString` runs neither. The
 * auth and membership providers therefore initialise to their logged-out state
 * and never reach for `localStorage` — which is exactly what a crawler should
 * see, since a prerendered page is public by definition.
 */

export type RenderResult = {
  /** Markup for `<div id="root">`. */
  appHtml: string;
  /** Serialised `<head>` contents. */
  headHtml: string;
  /** Inline script carrying the seed data to the client, or ''. */
  payloadScript: string;
  /** Present when the route redirected; the caller skips writing a file. */
  redirectedTo?: string;
  /** True when no `<Seo>` rendered — the prerenderer treats this as an error. */
  missingSeo: boolean;
};

export type RenderOptions = {
  /**
   * Raw project from `GET /api/v1/projects`, for a `/projects/:id` render.
   * Normalised here so the build script never has to reimplement the mapping
   * the app already owns.
   */
  rawProject?: ApiProject;
};

/** Mirrors `App.tsx`, with the static router swapped in for the browser one. */
export async function render(
  pathname: string,
  options: RenderOptions = {},
): Promise<RenderResult> {
  const handler = createStaticHandler(routeConfig);
  const request = new Request(`${SITE_URL}${pathname}`, { method: 'GET' });

  const context = await handler.query(request);

  // A `Response` here means the route tree redirected rather than matched.
  // Nothing to write to disk, so report it and let the caller decide.
  if (context instanceof Response) {
    return {
      appHtml: '',
      headHtml: '',
      payloadScript: '',
      redirectedTo: context.headers.get('Location') ?? '(unknown)',
      missingSeo: true,
    };
  }

  const router = createStaticRouter(routeConfig, context);

  const payload = options.rawProject
    ? { project: normalizeApiProject(options.rawProject) }
    : {};

  // Both must precede the render: `<Seo>` and the project seed are read during
  // the render pass, and a stale value would silently give one page another's
  // head or another project's data.
  resetSeoSink();
  setPrerenderPayload(payload);

  let appHtml: string;
  try {
    appHtml = renderToString(
      <AuthProvider>
        <MembershipProvider>
          <StaticRouterProvider router={router} context={context} />
        </MembershipProvider>
      </AuthProvider>,
    );
  } finally {
    // Never let a payload leak into the next page's render, even on a throw.
    resetPrerenderPayload();
  }

  const seo: SeoData | null = readSeoSink();

  return {
    appHtml,
    headHtml: seo ? renderSeoToHtml(seo, SITE_NAME, DEFAULT_LOCALE) : '',
    payloadScript: serializePrerenderPayload(payload),
    missingSeo: seo === null,
  };
}
