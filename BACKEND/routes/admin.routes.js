const express = require('express');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { listAuditLog } = require('../controllers/admin.controller');

const adminRouter = express.Router();

// Everything under /api/v1/admin is admin-only, without exception.
adminRouter.use(protect, authorize('admin'));

adminRouter.get('/audit', listAuditLog);

module.exports = adminRouter;
