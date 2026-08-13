const express = require('express');
const protect = require('../middleware/protect.middleware');
const { getUserPayments, getAvailablePaymentMethods } = require('../controllers/payment.controller');

const paymentRouter = express.Router();

paymentRouter.get('/user', protect, getUserPayments);
// Which rails are usable right now — drives the investor's payment choice.
paymentRouter.get('/methods', protect, getAvailablePaymentMethods);

module.exports = paymentRouter;

