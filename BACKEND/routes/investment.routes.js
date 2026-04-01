const express = require('express');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { createInvestment, getUserInvestments, getAllInvestments } = require('../controllers/investment.controller');


const investmentRouter = express.Router();

// user routes
investmentRouter.post('/', protect, createInvestment);
investmentRouter.get('/', protect, getUserInvestments);

// admin routes
investmentRouter.get('/all', protect, authorize('admin'), getAllInvestments);



module.exports = investmentRouter;