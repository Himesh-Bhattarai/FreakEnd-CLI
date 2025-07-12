const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { SMSRateLimit } = require('../models/sms.models');
const OTPUtils = require('../utils/otp.utils');

/**
 * Rate limiting middleware for SMS endpoints
 */
const smsRateLimit = rateLimit({
  windowMs: (process.env.SMS_RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  max: process.env.SMS_RATE_LIMIT_MAX_ATTEMPTS || 5,
  message: {
    success: false,
    message: 'Too many SMS requests. Please try again later.',
    retryAfter: Math.ceil(((process.env.SMS_RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.phoneNumber || req.ip;
  }
});

/**
 * Advanced rate limiting with database tracking
 */
const advancedRateLimit = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const windowMinutes = process.env.SMS_RATE_LIMIT_WINDOW_MINUTES || 15;
    const maxAttempts = process.env.SMS_RATE_LIMIT_MAX_ATTEMPTS || 5;
    
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    let rateLimit = await SMSRateLimit.findOne({ phoneNumber });

    if (!rateLimit) {
      rateLimit = new SMSRateLimit({
        phoneNumber,
        attempts: 1,
        windowStart: now,
        lastAttempt: now
      });
      await rateLimit.save();
      return next();
    }

    // Reset window if expired
    if (rateLimit.windowStart < windowStart) {
      rateLimit.attempts = 1;
      rateLimit.windowStart = now;
      rateLimit.lastAttempt = now;
      await rateLimit.save();
      return next();
    }

    // Check if max attempts reached
    if (rateLimit.attempts >= maxAttempts) {
      const remainingTime = Math.ceil((rateLimit.windowStart.getTime() + windowMinutes * 60 * 1000 - now.getTime()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many SMS requests for this phone number. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`,
        retryAfter: remainingTime
      });
    }

    // Increment attempts
    rateLimit.attempts += 1;
    rateLimit.lastAttempt = now;
    await rateLimit.save();

    next();
  } catch (error) {
    console.error('Advanced Rate Limit Error:', error);
    next(); // Continue on error to avoid blocking legitimate requests
  }
};

/**
 * Validation middleware for send OTP endpoint
 */
const validateSendOTP = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      const formatted = OTPUtils.formatPhoneNumber(value);
      if (!OTPUtils.isValidPhoneNumber(formatted)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    })
    .customSanitizer((value) => {
      return OTPUtils.formatPhoneNumber(value);
    }),
  
  body('purpose')
    .optional()
    .isIn(['login', 'signup', 'verification', 'password_reset'])
    .withMessage('Invalid purpose. Allowed values: login, signup, verification, password_reset'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation middleware for verify OTP endpoint
 */
const validateVerifyOTP = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      const formatted = OTPUtils.formatPhoneNumber(value);
      if (!OTPUtils.isValidPhoneNumber(formatted)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    })
    .customSanitizer((value) => {
      return OTPUtils.formatPhoneNumber(value);
    }),
  
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 4, max: 8 })
    .withMessage('OTP must be between 4 and 8 characters')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware to capture client information
 */
const captureClientInfo = (req, res, next) => {
  req.clientInfo = {
    ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown'
  };
  next();
};

/**
 * JWT Authentication middleware (optional for protected routes)
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  smsRateLimit,
  advancedRateLimit,
  validateSendOTP,
  validateVerifyOTP,
  captureClientInfo,
  authenticateToken
};