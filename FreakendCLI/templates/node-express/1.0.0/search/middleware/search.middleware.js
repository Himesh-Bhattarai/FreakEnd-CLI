const jwt = require('jsonwebtoken');
const { User } = require('../models/search.models');

/**
 * Authentication middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Admin role middleware
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

/**
 * Validate search request middleware
 */
const validateSearchRequest = (req, res, next) => {
  const { resource } = req.params;
  const allowedResources = ['users', 'items', 'posts'];
  
  if (!allowedResources.includes(resource)) {
    return res.status(400).json({
      success: false,
      message: `Invalid resource. Allowed resources: ${allowedResources.join(', ')}`
    });
  }
  
  // Validate query parameters
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a positive number'
    });
  }
  
  next();
};

/**
 * Rate limiting middleware for search
 */
const searchRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const userIP = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;
  
  if (!global.searchRateLimit) {
    global.searchRateLimit = {};
  }
  
  if (!global.searchRateLimit[userIP]) {
    global.searchRateLimit[userIP] = {
      count: 1,
      resetTime: now + windowMs
    };
  } else {
    const userLimit = global.searchRateLimit[userIP];
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
    } else {
      userLimit.count++;
      
      if (userLimit.count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many search requests. Please try again later.'
        });
      }
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  validateSearchRequest,
  searchRateLimit
};
