const express = require('express');
const config = require("./config/env")
const { prisma, connectDB, disconnectDB } = require('./config/db');

const app = express();

//connect to the database
connectDB();

const port = config.PORT

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello Backend Working!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});