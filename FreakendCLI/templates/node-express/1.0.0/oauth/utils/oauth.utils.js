const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class OAuthUtils {
  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {String} JWT token
   */
  static generateJWT(user) {
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      providers: user.oauthProviders.map(p => p.provider)
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'freakend-oauth',
      audience: 'freakend-app'
    });
  }

  /**
   * Generate state parameter for OAuth security
   * @returns {String} Random state string
   */
  static generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate state parameter
   * @param {String} state - State from callback
   * @param {String} sessionState - State from session
   * @returns {Boolean} Is valid
   */
  static validateState(state, sessionState) {
    return state === sessionState;
  }

  /**
   * Extract user IP address from request
   * @param {Object} req - Express request object
   * @returns {String} IP address
   */
  static getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           '127.0.0.1';
  }

  /**
   * Sanitize redirect URL
   * @param {String} url - URL to sanitize
   * @param {Array} allowedDomains - Allowed domains
   * @returns {String} Sanitized URL
   */
  static sanitizeRedirectURL(url, allowedDomains = []) {
    if (!url) return null;

    try {
      const parsedUrl = new URL(url);
      
      // Check if domain is allowed
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          parsedUrl.hostname === domain || 
          parsedUrl.hostname.endsWith(`.${domain}`)
        );
        
        if (!isAllowed) {
          return null;
        }
      }

      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }

      return parsedUrl.toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Format user data for client response
   * @param {Object} user - User object
   * @returns {Object} Formatted user data
   */
  static formatUserResponse(user) {
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      providers: user.oauthProviders.map(p => ({
        provider: p.provider,
        connectedAt: p.connectedAt
      })),
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Generate username from email
   * @param {String} email - Email address
   * @returns {String} Generated username
   */
  static generateUsernameFromEmail(email) {
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseUsername}${randomSuffix}`;
  }

  /**
   * Validate email format
   * @param {String} email - Email to validate
   * @returns {Boolean} Is valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Rate limit key generator
   * @param {String} ip - IP address
   * @param {String} provider - OAuth provider
   * @returns {String} Rate limit key
   */
  static generateRateLimitKey(ip, provider) {
    return `oauth:${provider}:${ip}`;
  }

  /**
   * Create OAuth error response
   * @param {String} error - Error type
   * @param {String} description - Error description
   * @returns {Object} Error response
   */
  static createErrorResponse(error, description) {
    return {
      success: false,
      error: {
        type: error,
        message: description,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Create OAuth success response
   * @param {Object} data - Success data
   * @param {String} message - Success message
   * @returns {Object} Success response
   */
  static createSuccessResponse(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = OAuthUtils;