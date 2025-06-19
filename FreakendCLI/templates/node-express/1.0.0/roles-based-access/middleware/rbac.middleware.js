const { ROLES, checkPermission } = require('../config/roles.config');
const AppError = require('../utils/errorHandler');

// Higher-order function to create role-based middleware
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new AppError('You are not authorized to perform this action', 403)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// Middleware to check specific permission
const checkAccess = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new AppError('You are not authorized to perform this action', 403)
      );
    }

    if (!checkPermission(requiredPermission, req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

module.exports = {
  restrictTo,
  checkAccess
};