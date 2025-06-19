const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const auth = (...requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
      }

      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = auth;