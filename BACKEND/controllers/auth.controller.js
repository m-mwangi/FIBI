const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/db');
const { getMembershipForAuth } = require('../services/membership.service');

const secret = config.JWT_SECRET;
const expiresIn = config.JWT_EXPIRES_IN;

/** Match jsonwebtoken-style strings (e.g. 1d, 24h, 3600s) for httpOnly cookie maxAge */
function jwtExpiresToMs(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value * 24 * 60 * 60 * 1000;
    }
    const s = String(value || "").trim();
    const m = /^(\d+)(s|m|h|d)$/i.exec(s);
    if (!m) return 7 * 24 * 60 * 60 * 1000;
    const n = parseInt(m[1], 10);
    const u = m[2].toLowerCase();
    const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    return n * mult[u];
}

async function createRegisteredUser(body, role) {
    const { name, email, password, dob, country, idType, idNumber } = body;
    if (!email || !password || !name) {
        return {
            error: { status: 400, body: { success: false, error: "Name, email and password are required" } },
        };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { error: { status: 400, body: { success: false, error: "User already exists" } } };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const parsedDob = dob ? new Date(dob) : null;

    let mappedIdType = idType;
    if (idType === "national-id") mappedIdType = "national_id";
    if (idType === "drivers-license") mappedIdType = "drivers_license";

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            dob: parsedDob,
            country,
            idType: mappedIdType,
            idNumber,
            role,
        },
    });
    return { user };
}

const sendTokenResponse = async (user, statusCode, res, message) => {
    if (!secret) {
        return res.status(500).json({
            success: false,
            error: "Server misconfiguration: JWT_SECRET is not set",
        });
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn });
    const membershipPayload = await getMembershipForAuth(user.id);

    const options = {
        maxAge: jwtExpiresToMs(expiresIn),
        httpOnly: true,
    };

    if (config.NODE_ENV === 'production') {
        options.secure = true;
    }


    res.status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token,
        message,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        membership: membershipPayload,
    });
};

const registerUser = async (req, res, next) => {
    try {
        const result = await createRegisteredUser(req.body, "investor");
        if (result.error) {
            return res.status(result.error.status).json(result.error.body);
        }
        await sendTokenResponse(result.user, 201, res, "User registered successfully");
    } catch (error) {
        next(error);
    }
};

const registerAdmin = async (req, res, next) => {
    try {
        const result = await createRegisteredUser(req.body, "admin");
        if (result.error) {
            return res.status(result.error.status).json(result.error.body);
        }
        const { user } = result;
        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            })
        }

        // Check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            })
        }

        // Check if user has the correct role
        if (role && user.role !== role) {
            return res.status(403).json({ 
                success: false, 
                error: 'Unauthorized role access' 
            })
        }

        // Send token response
        await sendTokenResponse(user, 200, res, 'User logged in successfully');
    } catch (error) {
        next(error);
    }
}

const getMe = async (req, res, next) => {
    try {
        const membershipPayload = await getMembershipForAuth(req.user.id);
        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
            membership: membershipPayload,
        });
    } catch (error) {
        next(error);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        res.cookie('token', 'none', { 
            expires: new Date(Date.now() + 10 * 1000), 
            httpOnly: true 
        });
        res.status(200).json({ 
            success: true, 
            message: 'User logged out successfully' 
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { registerUser, registerAdmin, loginUser, logoutUser, getMe };