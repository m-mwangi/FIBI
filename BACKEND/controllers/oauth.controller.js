const { prisma } = require('../config/db');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const appleSigninAuth = require('apple-signin-auth');

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const sendTokenResponse = (user, statusCode, res, message) => {
    const token = jwt.sign({ id: user.id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: config.NODE_ENV === 'production'
    };
    res.status(statusCode)
    .cookie('token', token, options)
    .json({ 
        success: true, 
        message, 
        token, 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
        } 
    });
};


const handleOAuthLogin = async (provider, providerId, name, res, next) => {
    try{
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required from OAuth provider'
            });
        };

        // Check if user already exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { authProvider: provider, providerId }
                ]
            }
        });

        if (user) {
            // Update auth provider if they previously registered via another method
            if (user.authProvider !== provider || user.providerId !== providerId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { authProvider: provider, providerId }
                });
            }
            return sendTokenResponse(user, 200, res, `Logged in with ${provider} successfully`);
        }

        // Create new user
        user = await prisma.user.create({
            data: {
                name,
                email,
                authProvider: provider,
                providerId,
                role: 'investor'
            }
        });

        return sendTokenResponse(user, 201, res, `Registered with ${provider} successfully`);

    } catch (error) {
        next(error);
    }
}


const googleAuth = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, error: 'Google ID token required.' });

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: config.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        await handleOAuthLogin('GOOGLE', payload.sub, payload.email, payload.name, res, next);
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid Google Token' });
    }
};


const facebookAuth = async (req, res, next) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ success: false, error: 'Facebook access token required.' });

        // Verify with Facebook graph API
        const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        
        await handleOAuthLogin('FACEBOOK', data.id, data.email, data.name, res, next);
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid Facebook Token' });
    }
};

const appleAuth = async (req, res, next) => {
    try {
        const { idToken, name } = req.body; // Apple only sends the name on first login! Frontend MUST send it if available.
        if (!idToken) return res.status(400).json({ success: false, error: 'Apple ID token required.' });

        const appleIdTokenClaims = await appleSigninAuth.verifyIdToken(idToken, {
            audience: config.APPLE_CLIENT_ID,
            ignoreExpiration: true, // You may want to set this to false in production
        });
        
        const email = appleIdTokenClaims.email;
        const providerId = appleIdTokenClaims.sub;
        
        await handleOAuthLogin('APPLE', providerId, email, name || 'Apple User', res, next);
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid Apple Token' });
    }
};


module.exports = {
    googleAuth,
    facebookAuth,
    appleAuth
};