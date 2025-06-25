const sendResponse = require('../utils/sendResponse');

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse.error(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse.error(res, 'Insufficient permissions.', 403);
    }

    next();
  };
};

module.exports = requireRole;