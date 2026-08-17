const express = require('express');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { oauthLimiter } = require('../middleware/rate-limit.middleware');
const {
    startZohoConnect,
    zohoCallback,
    zohoStatus,
    zohoDisconnect,
} = require('../controllers/zoho.controller');

const zohoRouter = express.Router();

// Admin-only, minted state token in hand.
zohoRouter.get('/connect', protect, authorize('admin'), startZohoConnect);

// Public by necessity — Zoho redirects the browser here and carries no session.
// Authorization comes from the signed `state` verified in the controller. Rate
// limited because it is reachable by anyone and each hit can cost an outbound
// token exchange.
zohoRouter.get('/oauth/callback', oauthLimiter, zohoCallback);

zohoRouter.get('/status', protect, authorize('admin'), zohoStatus);
zohoRouter.post('/disconnect', protect, authorize('admin'), zohoDisconnect);

module.exports = zohoRouter;
