const { verifyToken } = require('../config/auth.config');
const { ROLES } = require('../config/roles.config');
const AppError = require('../utils/errorHandler');

const authenticate = (req, res, next) => {
  // 1) Get token from headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return next(
      new AppError('Invalid token or user does not exist', 401)
    );
  }

  // 3) Attach user to request
  req.user = {
    id: decoded.userId,
    role: decoded.role
  };

  next();
};

// Middleware to restrict routes to logged-in users only
const protect = (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

module.exports = {
  authenticate,
  protect
};