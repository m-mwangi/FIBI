/**
 * Writes a real HTML file for every public route.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle).
 * For each route it renders the app to a string, splices the markup and the
 * `<head>` into the built `index.html`, and writes `dist/<route>/index.html`.
 *
 * Why this exists: the app is a client-rendered SPA, so the shipped
 * `index.html` contains an empty `<div id="root">`. Googlebot renders JS on a
 * deferred second pass, and the AI crawlers — GPTBot, PerplexityBot,
 * ClaudeBot — do not execute JS at all. Without this step those crawlers see a
 * blank page, which is the state the site was in before this change.
 *
 * Failure policy: a route that renders empty or without a `<Seo>` block fails
 * the build. Silently shipping a blank prerender would restore the original
 * problem while looking like it had been fixed.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distDir = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');
const ssrEntry = join(ssrDir, 'entry-server.js');

/** Where to read live project data for `/projects/:id`. */
const API_BASE = (process.env.PRERENDER_API_URL || process.env.VITE_API_URL || '')
  .replace(/\/$/, '');

/** Projects change constantly; a stale prerender is worse than none. */
const PROJECT_FETCH_TIMEOUT_MS = 15_000;

const log = (msg) => process.stdout.write(`[prerender] ${msg}\n`);
const warn = (msg) => process.stderr.write(`[prerender] WARN  ${msg}\n`);

/**
 * Fetches the public project list so detail pages can be prerendered.
 *
 * Never fatal. A build machine without network access to the API should still
 * produce a deployable site — it just ships without project detail pages,
 * which continue to work as client-rendered routes.
 */
async function fetchProjectRoutes() {
  if (!API_BASE) {
    warn(
      'PRERENDER_API_URL not set — skipping /projects/:id. Detail pages will ' +
        'stay client-only and invisible to non-JS crawlers.',
    );
    return [];
  }

  const url = `${API_BASE}/api/v1/projects`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(PROJECT_FETCH_TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      warn(`GET ${url} responded ${res.status} — skipping project detail pages.`);
      return [];
    }

    const payload = await res.json();
    // The controller has returned both a bare array and a wrapped object at
    // different points; accept either rather than coupling the build to one.
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.projects)
          ? payload.projects
          : [];

    const routes = list
      .filter((p) => p && p.id !== undefined && p.id !== null)
      .map((p) => ({
        path: `/projects/${p.id}`,
        indexable: true,
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: (p.updatedAt || p.createdAt || '').slice(0, 10) || undefined,
        // Seeds the render so the page ships with its content rather than a
        // spinner. Stripped again before the route list is handed to the
        // sitemap step.
        rawProject: p,
      }));

    log(`fetched ${routes.length} project route(s) from ${url}`);
    return routes;
  } catch (err) {
    warn(`could not reach ${url} (${err.message}) — skipping project detail pages.`);
    return [];
  }
}

/** `/` -> dist/index.html, `/legal/terms` -> dist/legal/terms/index.html */
function outputPathFor(routePath) {
  if (routePath === '/') return join(distDir, 'index.html');
  return join(distDir, routePath.replace(/^\/+/, ''), 'index.html');
}

/**
 * Splices rendered head and body into the built template.
 *
 * The template's static `<title>` is dropped first — leaving it would emit two
 * title elements, and which one a crawler honours is not worth guessing.
 */
function composeHtml(template, { headHtml, appHtml, payloadScript }) {
  // The shell's fallback title and description are removed before the
  // per-page ones are written, or every prerendered page would ship two of
  // each and leave the crawler to pick.
  let html = template
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/?>/i, '');

  html = html.replace('</head>', `  ${headHtml}\n  </head>`);

  const rootDiv = /<div id="root">\s*<\/div>/;
  if (!rootDiv.test(html)) {
    throw new Error(
      'index.html has no empty <div id="root"></div> to hydrate into — the ' +
        'prerenderer cannot place the markup.',
    );
  }
  html = html.replace(rootDiv, `<div id="root">${appHtml}</div>`);

  // A classic inline script runs during parsing, so it is guaranteed to have
  // set the payload before the deferred module bundle hydrates and reads it.
  if (payloadScript) {
    html = html.replace('</body>', `  ${payloadScript}\n  </body>`);
  }

  return html;
}

const EMPTY_ROOT = /<div id="root">\s*<\/div>/;

/**
 * Returns the pristine shell, which is also this script's own output target.
 *
 * `/` is written to `dist/index.html` — the same file the template is read
 * from — so a second `npm run prerender` without an intervening client build
 * would otherwise read an already-rendered page and fail. A copy is stashed
 * beside the SSR bundle on the run that sees a pristine shell, and reused on
 * runs that do not.
 *
 * The stash cannot go stale against the client build: `vite build` rewrites
 * `dist/index.html` with fresh asset hashes and an empty root, which is
 * exactly the condition for refreshing the stash.
 */
async function loadTemplate() {
  const livePath = join(distDir, 'index.html');
  const stashPath = join(ssrDir, 'index.template.html');

  const live = await readFile(livePath, 'utf8');
  if (EMPTY_ROOT.test(live)) {
    await mkdir(ssrDir, { recursive: true });
    await writeFile(stashPath, live, 'utf8');
    return live;
  }

  try {
    log('dist/index.html is already prerendered — using the stashed shell.');
    return await readFile(stashPath, 'utf8');
  } catch {
    throw new Error(
      'dist/index.html has no empty <div id="root"></div> and no stashed ' +
        'shell was found. Run `npm run build:client` first.',
    );
  }
}

async function main() {
  const template = await loadTemplate();

  const { render, buildTimeRoutes } = await import(ssrEntry);

  const routes = [...buildTimeRoutes(), ...(await fetchProjectRoutes())];

  log(`rendering ${routes.length} route(s)`);

  const failures = [];
  const written = [];

  for (const route of routes) {
    let result;
    try {
      result = await render(
        route.path,
        route.rawProject ? { rawProject: route.rawProject } : {},
      );
    } catch (err) {
      failures.push(`${route.path} — threw during render: ${err.message}`);
      continue;
    }

    if (result.redirectedTo) {
      warn(`${route.path} redirected to ${result.redirectedTo} — not written.`);
      continue;
    }
    if (result.missingSeo) {
      failures.push(`${route.path} — rendered without a <Seo> block.`);
      continue;
    }
    // A shell under ~200 bytes means the page rendered its chrome and no
    // content, which is the failure this whole step exists to prevent.
    if (result.appHtml.trim().length < 200) {
      failures.push(
        `${route.path} — rendered only ${result.appHtml.trim().length} bytes of markup.`,
      );
      continue;
    }

    const outPath = outputPathFor(route.path);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, composeHtml(template, result), 'utf8');
    written.push(route.path);
  }

  for (const path of written) log(`  ✓ ${path}`);

  // nginx serves this as the body of a real 404 response (see nginx.conf), so
  // a missing page looks like the site instead of the default nginx page. It
  // is written to a fixed filename rather than a route directory, and is
  // deliberately absent from the sitemap.
  const notFound = await render('/404');
  if (notFound.missingSeo) {
    failures.push('/404 — rendered without a <Seo> block.');
  } else {
    await writeFile(
      join(distDir, '404.html'),
      composeHtml(template, notFound),
      'utf8',
    );
    log('  ✓ /404.html (error page body)');
  }

  if (failures.length > 0) {
    process.stderr.write('\n[prerender] FAILED:\n');
    for (const f of failures) process.stderr.write(`  ✗ ${f}\n`);
    process.exit(1);
  }

  log(`wrote ${written.length} page(s)`);

  // Hand the route list to the sitemap step so both agree on what exists.
  // Only routes that were actually written are included — a sitemap entry for
  // a page that failed to render is how Search Console fills up with soft-404s.
  const writtenSet = new Set(written);
  const manifest = routes
    .filter((r) => writtenSet.has(r.path))
    .map(({ rawProject: _ignored, ...rest }) => rest);

  await writeFile(
    join(ssrDir, 'prerendered-routes.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );
}

main().catch((err) => {
  process.stderr.write(`[prerender] fatal: ${err.stack || err.message}\n`);
  process.exit(1);
});
