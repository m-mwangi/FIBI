const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require("./config/env")
const { prisma, connectDB, disconnectDB } = require('./config/db');
const errorHandler = require('./middleware/error.middleware');

//Import routes
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');
const investmentRoutes = require('./routes/investment.routes');


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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello Backend Working!');
});

//Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/investments', investmentRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});