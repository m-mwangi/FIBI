const { prisma } = require('../config/db');

/**
 * Dynamic sitemap for project detail pages.
 *
 * Project pages are prerendered into the frontend image at build time, but
 * projects are created through the admin UI — so the content cadence and the
 * deploy cadence are decoupled. A project added on Tuesday would otherwise sit
 * undiscovered until someone happened to deploy.
 *
 * Serving this half of the sitemap from the database closes that gap: a new
 * project is listed within one cache TTL. Google finds the URL, crawls it, and
 * renders the client-side page on its second pass; the next deploy then bakes
 * a prerendered copy for the crawlers that do not run JavaScript.
 *
 * The static pages stay in `sitemap-static.xml`, built alongside the frontend.
 * `sitemap.xml` is an index pointing at both, so neither file duplicates the
 * other and each is regenerated on the cadence that suits it.
 */

/** Canonical public origin, without a trailing slash. */
const siteOrigin = () =>
    (process.env.SITE_URL || process.env.FRONTEND_URL || 'https://fibicommunity.org')
        .trim()
        .replace(/\/+$/, '');

const xmlEscape = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

/**
 * Closed projects stay listed but rank lower.
 *
 * Removing them would strand any inbound links and turn a page Google already
 * knows about into a 404. They remain genuine content — a completed project is
 * part of the platform's track record.
 */
const priorityFor = (status) => (status === 'closed' ? '0.4' : '0.8');

const changefreqFor = (status) => (status === 'open' ? 'daily' : 'monthly');

exports.projectsSitemap = async (_req, res, next) => {
    try {
        const projects = await prisma.project.findMany({
            select: { id: true, status: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });

        const origin = siteOrigin();

        const urls = projects
            .map((p) => {
                const loc = `${origin}/projects/${p.id}`;
                const lastmod = p.updatedAt.toISOString().slice(0, 10);
                return [
                    '  <url>',
                    `    <loc>${xmlEscape(loc)}</loc>`,
                    `    <lastmod>${lastmod}</lastmod>`,
                    `    <changefreq>${changefreqFor(p.status)}</changefreq>`,
                    `    <priority>${priorityFor(p.status)}</priority>`,
                    '  </url>',
                ].join('\n');
            })
            .join('\n');

        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            urls,
            '</urlset>',
            '',
        ]
            .filter((line) => line !== '')
            .join('\n');

        res.set('Content-Type', 'application/xml; charset=utf-8');
        // Crawlers refetch a sitemap far more often than it changes. An hour
        // keeps a newly added project discoverable quickly without letting
        // every crawl hit the database.
        res.set('Cache-Control', 'public, max-age=3600');
        res.status(200).send(xml);
    } catch (error) {
        next(error);
    }
};
