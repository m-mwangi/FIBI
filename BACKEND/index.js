const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const config = require("./config/env")
const { prisma, connectDB, disconnectDB } = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { stripeWebhook } = require('./controllers/stripe.controller');

//Import routes
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');
const investmentRoutes = require('./routes/investment.routes');
const projectRoutes = require("./routes/project.route");
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const settingsRoutes = require('./routes/settings.routes');
const paymentRoutes = require('./routes/payment.routes');
const paymentMethodsRoutes = require('./routes/payment-methods.routes');
const paymentResponsesRoutes = require('./routes/payment-responses.routes');
const stripeRoutes = require('./routes/stripe.routes');
const membershipRoutes = require('./routes/membership.routes');

const app = express();

//connect to the database
connectDB();

const port = config.PORT

//middleware parse to pass data to the server side
app.use(
    cors({
        origin: config.FRONTEND_URL || true,
        credentials: true,
    })
);

// Stripe webhooks must receive the *raw* body for signature verification.
// This route MUST be registered before `express.json()` middleware.
app.post(
    '/api/v1/investments/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

// Stripe is also available under its own namespace.
app.post(
    '/api/v1/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello Backend Working!');
});

//Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/payment-methods', paymentMethodsRoutes);
app.use('/api/v1/payment-responses', paymentResponsesRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/stripe', stripeRoutes);
app.use('/api/v1/membership', membershipRoutes);

// Error Handler Middleware
app.use(errorHandler);



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});