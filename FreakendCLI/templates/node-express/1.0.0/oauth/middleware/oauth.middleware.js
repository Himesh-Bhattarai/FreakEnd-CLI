const jwt = require('jsonwebtoken');
const OAuthUser = require('../models/oauth.model');
const OAuthUtils = require('../utils/oauth.utils');

/**
 * Authenticate JWT token middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(
        OAuthUtils.createErrorResponse('unauthorized', 'Access token required')
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await OAuthUser.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json(
        OAuthUtils.createErrorResponse('unauthorized', 'Invalid or inactive user')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        OAuthUtils.createErrorResponse('token_expired', 'Token has expired')
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        OAuthUtils.createErrorResponse('invalid_token', 'Invalid token')
      );
    }

    return res.status(500).json(
      OAuthUtils.createErrorResponse('server_error', 'Internal server error')
    );
  }
};

/**
 * Check if user has specific OAuth provider
 */
const requireOAuthProvider = (provider) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        OAuthUtils.createErrorResponse('unauthorized', 'Authentication required')
      );
    }

    if (!req.user.hasOAuthProvider(provider)) {
      return res.status(403).json(
        OAuthUtils.createErrorResponse('forbidden', `${provider} account not linked`)
      );
    }

    next();
  };
};

/**
 * Rate limiting middleware for OAuth endpoints
 */
const rateLimitOAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = OAuthUtils.generateRateLimitKey(
      OAuthUtils.getClientIP(req),
      req.params.provider || 'oauth'
    );

    const now = Date.now();
    const userAttempts = attempts.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > userAttempts.resetTime) {
      userAttempts.count = 0;
      userAttempts.resetTime = now + windowMs;
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json(
        OAuthUtils.createErrorResponse('rate_limit_exceeded', 'Too many OAuth attempts')
      );
    }

    userAttempts.count++;
    attempts.set(key, userAttempts);

    next();
  };
};

/**
 * Validate OAuth state parameter
 */
const validateOAuthState = (req, res, next) => {
  const { state } = req.query;
  const sessionState = req.session.oauthState;

  if (!state || !sessionState || !OAuthUtils.validateState(state, sessionState)) {
    return res.status(400).json(
      OAuthUtils.createErrorResponse('invalid_state', 'Invalid OAuth state parameter')
    );
  }

  // Clear the state from session
  delete req.session.oauthState;
  next();
};

/**
 * Sanitize OAuth redirect URL
 */
const sanitizeRedirectURL = (req, res, next) => {
  const { redirect_uri } = req.query;
  
  if (redirect_uri) {
    const allowedDomains = [
      process.env.FRONTEND_DOMAIN,
      'localhost',
      '127.0.0.1'
    ].filter(Boolean);

    const sanitizedURL = OAuthUtils.sanitizeRedirectURL(redirect_uri, allowedDomains);
    
    if (!sanitizedURL) {
      return res.status(400).json(
        OAuthUtils.createErrorResponse('invalid_redirect_uri', 'Invalid redirect URI')
      );
    }

    req.redirectUri = sanitizedURL;
  }

  next();
};

/**
 * Log OAuth activity
 */
const logOAuthActivity = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log OAuth activity here
    console.log(`OAuth Activity: ${req.method} ${req.path}`, {
      ip: OAuthUtils.getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      provider: req.params.provider,
      success: res.statusCode < 400,
      timestamp: new Date().toISOString()
    });
    
    originalSend.call(this, data);
  };

  next();
};

/**
 * Require email verification for sensitive operations
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      OAuthUtils.createErrorResponse('unauthorized', 'Authentication required')
    );
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json(
      OAuthUtils.createErrorResponse('email_not_verified', 'Email verification required')
    );
  }

  next();
};

module.exports = {
  authenticateToken,
  requireOAuthProvider,
  rateLimitOAuth,
  validateOAuthState,
  sanitizeRedirectURL,
  logOAuthActivity,
  requireEmailVerification
};