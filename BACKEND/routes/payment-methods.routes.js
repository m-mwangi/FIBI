const express = require('express');
const protect = require('../middleware/protect.middleware');
const {
    getAvailablePaymentMethods,
    getUserPaymentMethods,
} = require('../controllers/paymentMethod.controller');

const paymentMethodsRouter = express.Router();

paymentMethodsRouter.get('/available', getAvailablePaymentMethods);
paymentMethodsRouter.get('/user', protect, getUserPaymentMethods);

module.exports = paymentMethodsRouter;

