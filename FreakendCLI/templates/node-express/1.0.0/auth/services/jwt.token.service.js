const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User.model');
const AppError = require('../utils/error.handler');
const config = require('../config/jwt.config');

// Convert jwt callback functions to promises
const signToken = promisify(jwt.sign);
const verifyToken = promisify(jwt.verify);

// Token service class
class TokenService {
    constructor() {
        this.accessTokenSecret = config.jwt.accessTokenSecret;
        this.refreshTokenSecret = config.jwt.refreshTokenSecret;
        this.accessTokenExpires = config.jwt.accessTokenExpires;
        this.refreshTokenExpires = config.jwt.refreshTokenExpires;
    }

    /**
     * Generate both access and refresh tokens
     * @param {Object} user - User object
     * @returns {Object} Tokens object
     */
    async generateTokens(user) {
        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);

        return {
            access: {
                token: accessToken,
                expires: new Date(Date.now() + this.accessTokenExpires * 1000)
            },
            refresh: {
                token: refreshToken,
                expires: new Date(Date.now() + this.refreshTokenExpires * 1000)
            }
        };
    }

    /**
     * Generate access token
     * @param {Object} user - User object
     * @returns {String} JWT token
     */
    async generateAccessToken(user) {
        return signToken(
            { id: user._id, role: user.role },
            this.accessTokenSecret,
            { expiresIn: this.accessTokenExpires }
        );
    }

    /**
     * Generate refresh token
     * @param {Object} user - User object
     * @returns {String} JWT token
     */
    async generateRefreshToken(user) {
        const token = signToken(
            { id: user._id, version: user.tokenVersion },
            this.refreshTokenSecret,
            { expiresIn: this.refreshTokenExpires }
        );

        // Store refresh token in database
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push({
            token,
            expires: new Date(Date.now() + this.refreshTokenExpires * 1000),
            createdByIp: req.ip
        });

        await user.save({ validateBeforeSave: false });

        return token;
    }

    /**
     * Verify access token
     * @param {String} token - JWT token
     * @returns {Object} Decoded token payload
     */
    async verifyAccessToken(token) {
        try {
            return await verifyToken(token, this.accessTokenSecret);
        } catch (err) {
            throw new AppError('Invalid access token', 401);
        }
    }

    /**
     * Verify refresh token
     * @param {String} token - JWT token
     * @returns {Object} Decoded token payload
     */
    async verifyRefreshToken(token) {
        try {
            const decoded = await verifyToken(token, this.refreshTokenSecret);

            // Check if user exists and token version matches
            const user = await User.findOne({
                _id: decoded.id,
                'refreshTokens.token': token
            });

            if (!user) {
                throw new Error();
            }

            return decoded;
        } catch (err) {
            throw new AppError('Invalid refresh token', 401);
        }
    }

    /**
     * Generate random token for password reset/email verification
     * @returns {String} Random token
     */
    generateRandomToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Remove refresh token
     * @param {String} token - Refresh token to remove
     */
    async removeRefreshToken(token) {
        const decoded = await this.verifyRefreshToken(token);
        await User.updateOne(
            { _id: decoded.id },
            { $pull: { refreshTokens: { token } } }
        );
    }

    /**
     * Remove all refresh tokens for a user
     * @param {String} userId - User ID
     */
    async removeAllRefreshTokens(userId) {
        await User.updateOne(
            { _id: userId },
            { $set: { refreshTokens: [], tokenVersion: crypto.randomBytes(16).toString('hex') } }
        );
    }
}

module.exports = new TokenService();