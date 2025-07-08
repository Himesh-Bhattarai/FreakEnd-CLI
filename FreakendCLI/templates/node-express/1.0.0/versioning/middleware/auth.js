const { verifyToken } = require('../config/jwt');
const { sendError } = require('../utils/responseHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendError(res, 401, 'Access token required');
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      return sendError(res, 403, 'Invalid token');
    } else {
      return sendError(res, 500, 'Token verification failed');
    }
  }
};

// Optional: Generate a test token for development
const generateTestToken = (req, res) => {
  const testPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'user'
  };
  
  const token = require('../config/jwt').generateToken(testPayload);
  res.json({ token, message: 'Test token generated' });
};

module.exports = {
  authenticateToken,
  generateTestToken
};