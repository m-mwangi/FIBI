const express = require('express');
const { googleAuth,facebookAuth,appleAuth } = require('../controllers/oauth.controller');
const oauthRouter = express.Router();

// Google OAuth

oauthRouter.post('/google', googleAuth);

// Facebook OAuth
oauthRouter.post('/facebook', facebookAuth);

// Apple OAuth
oauthRouter.post('/apple', appleAuth);

module.exports = oauthRouter;