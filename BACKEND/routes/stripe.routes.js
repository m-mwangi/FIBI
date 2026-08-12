const express = require('express');

const stripeRouter = express.Router();

stripeRouter.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, provider: 'stripe' });
});

module.exports = stripeRouter;

