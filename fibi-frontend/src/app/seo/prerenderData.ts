import type { Project } from '../data/projects';

/**
 * Carries per-page data from the prerenderer into the render, and from the
 * prerendered HTML into the first client render.
 *
 * Project detail pages load their project in an effect, which never runs at
 * build time — so without this the prerendered page would be a loading
 * spinner. That is precisely the thin content the prerender step exists to
 * avoid, and project pages are the ones with commercial intent behind them.
 *
 * The same payload has to reach the browser too. Hydration compares the
 * client's first render against the server's markup, so if the server rendered
 * a project and the client started from `null` React would discard the whole
 * tree. Embedding the payload in the page and reading it back on the first
 * render keeps both sides identical.
 */

const GLOBAL_KEY = '__FIBI_PRERENDER__';

export type PrerenderPayload = {
  /** Seed for `/projects/:id`. */
  project?: Project | null;
};

declare global {
  interface Window {
    [GLOBAL_KEY]?: PrerenderPayload;
  }
}

let serverPayload: PrerenderPayload = {};

/** Prerenderer only. Call before each render, and reset after. */
export function setPrerenderPayload(payload: PrerenderPayload): void {
  serverPayload = payload;
}

export function resetPrerenderPayload(): void {
  serverPayload = {};
}

/**
 * Reads the payload for the current page from whichever side is asking.
 *
 * Returns an empty object for routes that were never prerendered, so callers
 * fall back to their normal client fetch.
 */
export function getPrerenderPayload(): PrerenderPayload {
  if (typeof window === 'undefined') return serverPayload;
  return window[GLOBAL_KEY] ?? {};
}

/**
 * Consumes the payload so it is used once.
 *
 * Without this, navigating from one project to another client-side would
 * re-seed the second page with the first page's data — the payload describes
 * the entry URL only.
 */
export function consumePrerenderPayload(): PrerenderPayload {
  const payload = getPrerenderPayload();
  if (typeof window !== 'undefined') delete window[GLOBAL_KEY];
  return payload;
}

/**
 * Serialises the payload into an inline script for the prerendered HTML.
 *
 * `<` is escaped so a value containing `</script>` cannot terminate the tag
 * early — the standard injection vector for embedded JSON.
 */
export function serializePrerenderPayload(payload: PrerenderPayload): string {
  if (!payload || Object.keys(payload).length === 0) return '';
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<script>window.${GLOBAL_KEY}=${json};</script>`;
}
