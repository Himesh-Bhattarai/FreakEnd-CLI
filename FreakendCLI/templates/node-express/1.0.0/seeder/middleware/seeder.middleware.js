const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SeederUtils = require('../utils/seeder.utils');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(
        SeederUtils.formatResponse(false, 'Access token required')
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json(
        SeederUtils.formatResponse(false, 'Invalid token - user not found')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json(
      SeederUtils.formatResponse(false, 'Invalid or expired token')
    );
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      SeederUtils.formatResponse(false, 'Admin access required for seeder operations')
    );
  }
  next();
};

const validateSeederEnvironment = (req, res, next) => {
  try {
    SeederUtils.validateSeederConfig();
    next();
  } catch (error) {
    return res.status(400).json(
      SeederUtils.formatResponse(false, error.message)
    );
  }
};

const checkDatabaseConnection = async (req, res, next) => {
  try {
    await SeederUtils.checkDatabaseConnection();
    next();
  } catch (error) {
    return res.status(500).json(
      SeederUtils.formatResponse(false, error.message)
    );
  }
};

const sanitizeSeederInput = (req, res, next) => {
  if (req.body) {
    req.body = SeederUtils.sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = SeederUtils.sanitizeInput(req.query);
  }
  next();
};

const confirmationRequired = (req, res, next) => {
  const { confirm } = req.body;
  
  if (confirm !== 'yes' && confirm !== true) {
    return res.status(400).json(
      SeederUtils.formatResponse(false, 'Confirmation required. Send "confirm": "yes" in request body')
    );
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  validateSeederEnvironment,
  checkDatabaseConnection,
  sanitizeSeederInput,
  confirmationRequired
};