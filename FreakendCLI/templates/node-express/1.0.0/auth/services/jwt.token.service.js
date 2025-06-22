const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/universal.User.model');
const AppError = require('../utils/app.error');
const { createHash } = require('crypto');

class TokenService {
    constructor() {
        this.validateSecrets();
        this.accessTokenExpires = '15m';
        this.refreshTokenExpires = '7d';
    }

    validateSecrets() {
        if (!process.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET.length < 64) {
            throw new Error('Invalid ACCESS_TOKEN_SECRET: Must be at least 64 characters');
        }
        if (!process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET.length < 64) {
            throw new Error('Invalid REFRESH_TOKEN_SECRET: Must be at least 64 characters');
        }
        this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    }

    async generateTokens(user, req) {
        const deviceFingerprint = this.createDeviceFingerprint(req);
        const accessToken = await this.generateAccessToken(user, deviceFingerprint);
        const refreshToken = await this.generateRefreshToken(user, deviceFingerprint);

        // Store only hashed refresh token
        await this.storeRefreshToken(user, refreshToken, req.ip);

        return {
            access: {
                token: accessToken,
                expires: new Date(Date.now() + 15 * 60 * 1000)
            },
            refresh: {
                token: refreshToken,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        };
    }

    createDeviceFingerprint(req) {
        const userAgent = req.headers['user-agent'] || '';
        const ip = req.ip || req.connection.remoteAddress || '';
        const acceptLanguage = req.headers['accept-language'] || '';

        return createHash('sha256')
            .update(`${userAgent}${ip}${acceptLanguage}${process.env.APP_SECRET || 'default-secret'}`)
            .digest('hex');
    }

    async generateAccessToken(user, deviceFingerprint) {
        return jwt.sign(
            {
                id: user._id,
                role: user.role,
                v: user.tokenVersion || 0,
                d: deviceFingerprint
            },
            this.accessTokenSecret,
            {
                expiresIn: this.accessTokenExpires,
                algorithm: 'HS256'
            }
        );
    }

    async generateRefreshToken(user, deviceFingerprint) {
        return jwt.sign(
            {
                id: user._id,
                v: user.tokenVersion || 0,
                d: deviceFingerprint
            },
            this.refreshTokenSecret,
            {
                expiresIn: this.refreshTokenExpires,
                algorithm: 'HS256'
            }
        );
    }

    async storeRefreshToken(user, refreshToken, ip) {
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');

        await User.findByIdAndUpdate(user._id, {
            $push: {
                refreshTokens: {
                    token: hashedToken,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    createdByIp: ip || 'unknown',
                    createdAt: new Date()
                }
            }
        });
    }

    async verifyAccessToken(token, req) {
        try {
            const decoded = jwt.verify(token, this.accessTokenSecret, { algorithms: ['HS256'] });

            // Verify token version
            const user = await User.findById(decoded.id);
            if (!user || user.tokenVersion !== decoded.v) {
                throw new AppError('Token revoked', 401);
            }

            // Verify device fingerprint if provided in token
            if (decoded.d && req) {
                const expectedFingerprint = this.createDeviceFingerprint(req);
                if (decoded.d !== expectedFingerprint) {
                    throw new AppError('Invalid device', 401);
                }
            }

            return decoded;
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError('Invalid access token', 401);
        }
    }

    async verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.refreshTokenSecret, { algorithms: ['HS256'] });
            const hashedToken = createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                _id: decoded.id,
                'refreshTokens.token': hashedToken,
                'refreshTokens.expires': { $gt: new Date() }
            });

            if (!user || user.tokenVersion !== decoded.v) {
                throw new AppError('Token revoked', 401);
            }

            return decoded;
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError('Invalid refresh token', 401);
        }
    }

    generateRandomToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async removeRefreshToken(token) {
        try {
            const hashedToken = createHash('sha256').update(token).digest('hex');

            const result = await User.updateOne(
                { 'refreshTokens.token': hashedToken },
                { $pull: { refreshTokens: { token: hashedToken } } }
            );

            return result;
        } catch (error) {
            throw new AppError('Failed to remove refresh token', 500);
        }
    }

    async invalidateAllTokens(userId) {
        try {
            await User.findByIdAndUpdate(userId, {
                $inc: { tokenVersion: 1 },
                $set: { refreshTokens: [] }
            });
        } catch (error) {
            throw new AppError('Failed to invalidate tokens', 500);
        }
    }

    async cleanExpiredTokens(userId) {
        try {
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    refreshTokens: {
                        expires: { $lt: new Date() }
                    }
                }
            });
        } catch (error) {
            // Silent cleanup failure - not critical
        }
    }
}

const tokenService = new TokenService();
module.exports = tokenService;