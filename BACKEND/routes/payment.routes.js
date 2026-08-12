const express = require('express');
const protect = require('../middleware/protect.middleware');
const { getUserPayments } = require('../controllers/payment.controller');

const paymentRouter = express.Router();

paymentRouter.get('/user', protect, getUserPayments);

module.exports = paymentRouter;

