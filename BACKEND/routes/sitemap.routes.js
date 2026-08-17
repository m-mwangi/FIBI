const express = require('express');
const { projectsSitemap } = require('../controllers/sitemap.controller');

const sitemapRouter = express.Router();

/**
 * Mounted at the site root rather than under /api/v1.
 *
 * A sitemap may only list URLs at or below its own path, so a sitemap living
 * at /api/v1/... could not legally contain /projects/<id>. It has to be served
 * from the root — see the proxy rule in deploy/nginx.conf.
 */
sitemapRouter.get('/sitemap-projects.xml', projectsSitemap);

module.exports = sitemapRouter;
