const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  switchAccount
} = require('../controllers/auth.controller');
const {
  validateSignup,
  validateLogin,
  validateSwitchAccount
} = require('../middleware/auth.middleware');
const {
  verifyAccessToken,
  verifyRefreshToken
} = require('../services/auth.service');

// Public Routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Protected Routes
router.post('/logout', verifyRefreshToken, logout);
router.post('/switch-account', verifyAccessToken, validateSwitchAccount, switchAccount);

module.exports = router;