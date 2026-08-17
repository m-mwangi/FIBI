/**
 * Emits `dist/sitemap.xml` and `dist/robots.txt` from the routes the
 * prerenderer actually wrote.
 *
 * Deriving both from `prerendered-routes.json` rather than from a hand-kept
 * list means the sitemap cannot advertise a URL that was never generated —
 * which is the usual reason a sitemap fills Search Console with soft-404s.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distDir = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const log = (msg) => process.stdout.write(`[sitemap] ${msg}\n`);

const xmlEscape = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function buildSitemap(siteUrl, routes) {
  const today = new Date().toISOString().slice(0, 10);

  const entries = routes
    .filter((r) => r.indexable)
    .map((r) => {
      const loc = `${siteUrl}${r.path === '/' ? '/' : r.path.replace(/\/+$/, '')}`;
      const lastmod = r.lastmod || today;
      return [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${r.changefreq}</changefreq>`,
        `    <priority>${r.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n');
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * robots.txt.
 *
 * AI crawlers are allowed deliberately. Blocking GPTBot, ClaudeBot,
 * PerplexityBot and Google-Extended removes any possibility of the site being
 * cited in an AI answer — for a platform whose buyers research before they
 * commit, that visibility is the point of publishing the guides at all. The
 * trade is that the content becomes training and retrieval material. Flip
 * `disallowAiCrawlers` if that trade stops being worth it.
 *
 * Note that `Google-Extended` governs Gemini and AI Overviews grounding only;
 * it does not affect ordinary Google Search indexing, which follows Googlebot.
 */
function buildRobots(siteUrl, privatePrefixes, { disallowAiCrawlers = false } = {}) {
  const lines = [
    '# https://www.robotstxt.org/robotstxt.html',
    '',
    'User-agent: *',
    'Allow: /',
  ];

  // Authenticated surfaces. These are also `noindex` at the page level —
  // robots.txt alone cannot deindex a URL that is already indexed, because a
  // disallowed page can never be recrawled to discover the noindex.
  for (const prefix of privatePrefixes) lines.push(`Disallow: ${prefix}`);

  lines.push(
    '',
    '# Query-string variants of the project list would otherwise be crawled as',
    '# separate URLs competing with the canonical listing.',
    'Disallow: /*?q=',
    'Disallow: /*?page=',
    '',
  );

  const AI_CRAWLERS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'meta-externalagent',
    'Bytespider',
    'CCBot',
  ];

  // Consecutive `User-agent` lines form a single rule group, so the whole
  // fleet shares one block instead of repeating identical rules twelve times.
  if (disallowAiCrawlers) {
    lines.push('# AI crawlers blocked by policy.');
    for (const agent of AI_CRAWLERS) lines.push(`User-agent: ${agent}`);
    lines.push('Disallow: /', '');
  } else {
    lines.push(
      '# AI crawlers are welcome on public content and held to the same',
      '# restrictions as everyone else. Being crawlable is a precondition for',
      '# being cited in an AI answer.',
    );
    for (const agent of AI_CRAWLERS) lines.push(`User-agent: ${agent}`);
    lines.push('Allow: /');
    for (const prefix of privatePrefixes) lines.push(`Disallow: ${prefix}`);
    lines.push('');
  }

  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`, '');
  return lines.join('\n');
}

async function main() {
  const routes = JSON.parse(
    await readFile(join(ssrDir, 'prerendered-routes.json'), 'utf8'),
  );
  const { SITE_URL, PRIVATE_ROUTE_PREFIXES } = await import(
    join(ssrDir, 'entry-server.js')
  );

  const sitemap = buildSitemap(SITE_URL, routes);
  await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8');

  const robots = buildRobots(SITE_URL, PRIVATE_ROUTE_PREFIXES);
  await writeFile(join(distDir, 'robots.txt'), robots, 'utf8');

  const indexable = routes.filter((r) => r.indexable).length;
  log(`sitemap.xml — ${indexable} indexable URL(s) of ${routes.length} prerendered`);
  log(`robots.txt — sitemap at ${SITE_URL}/sitemap.xml`);
}

main().catch((err) => {
  process.stderr.write(`[sitemap] fatal: ${err.stack || err.message}\n`);
  process.exit(1);
});
