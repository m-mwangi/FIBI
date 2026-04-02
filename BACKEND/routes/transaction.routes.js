const express = require('express');
const { createTransaction, getUserTransactions, getAllTransactions } = require('../controllers/transaction.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');

const transactionRouter = express.Router();

transactionRouter.post('/', protect, createTransaction);
transactionRouter.get('/user', protect, getUserTransactions);

// admin routes
transactionRouter.get('/all', protect, authorize('admin'), getAllTransactions);

module.exports = transactionRouter;