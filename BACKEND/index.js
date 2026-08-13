const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require("path");
const config = require("./config/env")
const { prisma, connectDB, disconnectDB } = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { globalLimiter } = require('./middleware/rate-limit.middleware');
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
const adminRoutes = require('./routes/admin.routes');

const app = express();

//connect to the database
connectDB();

const port = config.PORT

// Behind the nginx edge proxy. Without this Express reads the proxy's own
// address as req.ip and treats every request as insecure, because it ignores
// X-Forwarded-For / X-Forwarded-Proto. The value is a hop count rather than
// `true` so clients cannot spoof their IP by injecting the header themselves.
const trustProxy = Number.parseInt(config.TRUST_PROXY ?? '', 10);
if (Number.isFinite(trustProxy) && trustProxy > 0) {
    app.set('trust proxy', trustProxy);
}

// CORS. `credentials: true` means the browser will attach cookies to allowed
// cross-origin requests, so the allow-list has to be exact: reflecting whatever
// Origin the caller sent (the `origin: true` shorthand) would let any website
// make authenticated calls on a logged-in user's behalf.
//
// In production FRONTEND_URL is required and is the only accepted origin, plus
// its www form — a visitor who lands on www.<domain> is 301'd to the apex by the
// proxy, but the redirect happens after the browser has already fixed the origin
// for any in-flight request. In development it falls back to reflecting the
// origin, which is what makes the Vite dev server on a random port work.
if (config.NODE_ENV === 'production' && !config.FRONTEND_URL) {
    throw new Error(
        'FRONTEND_URL must be set in production — without it CORS cannot be locked ' +
        'to this site and any origin could make authenticated requests.'
    );
}

const allowedOrigins = config.FRONTEND_URL
    ? [...new Set([
        config.FRONTEND_URL,
        // Guarded so a FRONTEND_URL that already names www does not become
        // https://www.www.example.com.
        config.FRONTEND_URL.replace(/^(https?:\/\/)(?!www\.)/, '$1www.'),
    ])]
    : null;

app.use(
    cors({
        origin: allowedOrigins ?? true,
        credentials: true,
    })
);

// Security response headers: HSTS, X-Content-Type-Options, Referrer-Policy,
// frame denial, and cross-origin isolation defaults.
//
// contentSecurityPolicy is off because this process serves JSON and uploaded
// images, not HTML — the frontend's own CSP is set at the nginx edge, and a
// second policy here would only apply to error pages.
//
// crossOriginResourcePolicy is relaxed to cross-origin so /uploads images can be
// rendered by the frontend, which is served from a different origin.
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// Blunt ceiling in front of everything. Per-endpoint limiters in
// middleware/rate-limit.middleware.js do the precise work on auth routes.
app.use(globalLimiter);

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

// Body size caps. Unbounded parsing lets a single request pin memory and CPU;
// no JSON endpoint here legitimately needs more than 100kb (file uploads go
// through multer, which enforces its own limits).
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Express does not disclose its identity by default in v5, but the header is
// still emitted by some middleware paths — drop it so the stack is not advertised.
app.disable('x-powered-by');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello Backend Working!');
});

// Container liveness probe (see HEALTHCHECK in the Dockerfile). Deliberately
// does not touch the database: a slow query should not make Docker kill and
// restart an otherwise healthy API process.
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
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
app.use('/api/v1/admin', adminRoutes);

// Error Handler Middleware
app.use(errorHandler);



// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// `docker compose up -d --build` sends SIGTERM and waits 10s before SIGKILL.
// Draining in-flight requests and closing the Prisma pool here avoids dropped
// responses and leaked Postgres connections on every redeploy.
const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
    // Backstop in case a connection refuses to close.
    setTimeout(() => {
        console.error('Forcing shutdown after 10s timeout.');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));