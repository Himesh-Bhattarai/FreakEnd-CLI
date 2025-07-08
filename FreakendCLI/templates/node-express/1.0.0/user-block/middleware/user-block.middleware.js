const User = require('../models/User'); // Assume User model exists
const { UserBlockUtils } = require('../utils/user-block.utils');

/**
 * Middleware to check if user is blocked
 * Should be used after authentication middleware
 */
const checkUserBlocked = async (req, res, next) => {
  try {
    // Skip check if no user is authenticated
    if (!req.user || !req.user.id) {
      return next();
    }
    
    const userId = req.user.id;
    
    // Validate user ID
    if (!UserBlockUtils.isValidUserId(userId)) {
      return res.status(400).json(
        UserBlockUtils.createErrorResponse('Invalid user ID format', 400)
      );
    }
    
    // Find user and check block status
    const user = await User.findById(userId).select('isBlocked blockedAt blockReason');
    
    if (!user) {
      return res.status(404).json(
        UserBlockUtils.createErrorResponse('User not found', 404)
      );
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      UserBlockUtils.logError(
        new Error('Blocked user attempted access'),
        'blocked_user_access',
        { userId, route: req.originalUrl }
      );
      
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Your account has been blocked.',
          statusCode: 403,
          details: {
            isBlocked: true,
            blockedAt: user.blockedAt,
            reason: user.blockReason
          },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    next();
  } catch (error) {
    UserBlockUtils.logError(error, 'check_user_blocked', { userId: req.user?.id });
    
    res.status(500).json(
      UserBlockUtils.createErrorResponse(
        'Failed to verify user block status',
        500,
        error.message
      )
    );
  }
};

/**
 * Middleware to check if user has admin privileges
 * Should be used after authentication middleware
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json(
        UserBlockUtils.createErrorResponse('Authentication required', 401)
      );
    }
    
    const user = await User.findById(req.user.id).select('role isBlocked');
    
    if (!user) {
      return res.status(404).json(
        UserBlockUtils.createErrorResponse('User not found', 404)
      );
    }
    
    // Check if admin is blocked
    if (user.isBlocked) {
      return res.status(403).json(
        UserBlockUtils.createErrorResponse('Admin account is blocked', 403)
      );
    }
    
    // Check admin role (assuming role field exists)
    if (user.role !== 'admin') {
      return res.status(403).json(
        UserBlockUtils.createErrorResponse('Admin privileges required', 403)
      );
    }
    
    next();
  } catch (error) {
    UserBlockUtils.logError(error, 'require_admin', { userId: req.user?.id });
    
    res.status(500).json(
      UserBlockUtils.createErrorResponse(
        'Failed to verify admin privileges',
        500,
        error.message
      )
    );
  }
};

/**
 * Middleware to validate block/unblock request parameters
 */
const validateBlockRequest = (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  // Validate user ID
  if (!UserBlockUtils.isValidUserId(id)) {
    return res.status(400).json(
      UserBlockUtils.createErrorResponse('Invalid user ID format', 400)
    );
  }
  
  // Sanitize reason if provided
  if (reason) {
    req.body.reason = UserBlockUtils.sanitizeReason(reason);
  }
  
  next();
};

module.exports = {
  checkUserBlocked,
  requireAdmin,
  validateBlockRequest
};