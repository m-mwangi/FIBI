const express = require('express');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { listAuditLog } = require('../controllers/admin.controller');
const {
    listBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
} = require('../controllers/bankAccount.controller');

const adminRouter = express.Router();

// Everything under /api/v1/admin is admin-only, without exception.
adminRouter.use(protect, authorize('admin'));

adminRouter.get('/audit', listAuditLog);

// Bank accounts back the wire instructions investors are shown, so these are
// admin-only like everything else under /admin.
adminRouter.get('/bank-accounts', listBankAccounts);
adminRouter.post('/bank-accounts', createBankAccount);
adminRouter.put('/bank-accounts/:id', updateBankAccount);
adminRouter.delete('/bank-accounts/:id', deleteBankAccount);

module.exports = adminRouter;
