const express = require('express');
const protect = require('../middleware/protect.middleware');
const { getPaymentResponses } = require('../controllers/paymentResponse.controller');

const paymentResponsesRouter = express.Router();

paymentResponsesRouter.get('/payment/:paymentId', protect, getPaymentResponses);

module.exports = paymentResponsesRouter;

