const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/db');

const protect = async (req, res, next) => {
    try {
        let token;

        //Extract token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // if no token is found, return unauthorized
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Find user by ID from token payload - using Prisma instead of Mongoose
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true, dob: true, country: true, idType: true, idNumber: true, createdAt: true, passwordChangedAt: true }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }

        // A token minted before the last password change is dead. This is what
        // makes "reset my password" actually evict an attacker who already holds
        // a valid session, instead of leaving it live until natural expiry.
        // `iat` is in seconds, so compare on second granularity.
        if (user.passwordChangedAt && decoded.iat) {
            const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
            if (decoded.iat < changedAtSec) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: Password was changed. Please log in again",
                });
            }
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token expired. Please log in again",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token",
            });
        }
        next(error);
    }
}

module.exports = protect;