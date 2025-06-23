const tokenService = require('../services/jwt.token.service');
const User = require('../models/universal.User.model');

// Middleware to authenticate access token
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify the access token
        const decoded = await tokenService.verifyAccessToken(token, req);

        // Get user info and attach to request
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

// Middleware to authenticate refresh token from cookies
const authenticateRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        // Verify the refresh token
        const decoded = await tokenService.verifyRefreshToken(refreshToken);

        // Get user info and attach to request
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

// Optional: Middleware for routes that work with or without authentication
const optionalAuth = async (req, res, next) => {
    try {
        const cookieToken = req.cookies?.accessToken;
        const authHeader = req.headers['authorization'];
        const headerToken = authHeader && authHeader.split(' ')[1];

        const token = cookieToken || headerToken;

        if (token) {
            const decoded = await tokenService.verifyAccessToken(token, req);
            const user = await User.findById(decoded.id);

            if (user) {
                req.user = {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                };
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    authenticateToken,
    authenticateRefreshToken,
    optionalAuth
};