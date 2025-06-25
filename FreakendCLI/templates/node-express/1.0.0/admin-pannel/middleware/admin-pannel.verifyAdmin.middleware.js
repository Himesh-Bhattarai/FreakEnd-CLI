const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const sendResponse = require('../utils/sendResponse');

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return sendResponse.error(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return sendResponse.error(res, 'Invalid token. User not found.', 401);
    }

    if (user.status !== 'active') {
      return sendResponse.error(res, 'Account is not active.', 403);
    }

    if (!user.isAdmin()) {
      return sendResponse.error(res, 'Access denied. Admin privileges required.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendResponse.error(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendResponse.error(res, 'Token expired.', 401);
    }
    return sendResponse.error(res, 'Authentication failed.', 500);
  }
};

module.exports = verifyAdmin;