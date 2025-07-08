const winston = require('winston');
const path = require('path');

/**
 * Logger configuration for user block operations
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-block' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'user-block-error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'user-block-combined.log') 
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * Utility class for user block operations
 */
class UserBlockUtils {
  
  /**
   * Log block action
   * @param {string} action - Action type (block/unblock)
   * @param {string} userId - Target user ID
   * @param {string} adminId - Admin performing action
   * @param {string} reason - Reason for action
   */
  static logBlockAction(action, userId, adminId, reason = null) {
    const logData = {
      action,
      userId,
      adminId,
      reason,
      timestamp: new Date().toISOString()
    };
    
    logger.info('User block action performed', logData);
  }
  
  /**
   * Log error in block operations
   * @param {Error} error - Error object
   * @param {string} operation - Operation being performed
   * @param {Object} context - Additional context
   */
  static logError(error, operation, context = {}) {
    logger.error('User block operation failed', {
      error: error.message,
      stack: error.stack,
      operation,
      context,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Validate user ID format
   * @param {string} userId - User ID to validate
   * @returns {boolean} True if valid
   */
  static isValidUserId(userId) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(userId);
  }
  
  /**
   * Sanitize reason text
   * @param {string} reason - Reason text
   * @returns {string} Sanitized reason
   */
  static sanitizeReason(reason) {
    if (!reason) return null;
    return reason.trim().substring(0, 500);
  }
  
  /**
   * Format block response
   * @param {Object} user - User document
   * @param {string} action - Action performed
   * @returns {Object} Formatted response
   */
  static formatBlockResponse(user, action) {
    return {
      success: true,
      message: `User ${action} successfully`,
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedAt: user.blockedAt,
        action: action,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Create standardized error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   * @returns {Object} Error response object
   */
  static createErrorResponse(message, statusCode = 500, details = null) {
    return {
      success: false,
      error: {
        message,
        statusCode,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = {
  UserBlockUtils,
  logger
};