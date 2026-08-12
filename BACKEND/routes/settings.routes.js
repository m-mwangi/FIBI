const express = require('express');
const { getPublicSettings, getSettings, updateSettings } = require('../controllers/settings.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');

const settingsRouter = express.Router();

settingsRouter.get('/public', getPublicSettings);
settingsRouter.get('/', protect, authorize('admin'), getSettings);
settingsRouter.put('/', protect, authorize('admin'), updateSettings);

module.exports = settingsRouter;
