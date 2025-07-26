const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    logout,
    logoutAllDevices,
    switchAccount,
    refreshToken
} = require('../controllers/auth.controller');

const {
    validateSignup,
    validateLogin,
    validateSwitchAccount
} = require('../middleware/auth.middleware');

const {
    authenticateToken,
    authenticateRefreshToken
} = require('../middleware/jwt.token.middleware');



// Public Routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

console.log("validateSwitchAccount:", typeof validateSwitchAccount); // should say 'function'
console.log("switchAccount:", typeof switchAccount); // should say 'function'

// Protected Routes (require access token)
router.post('/logout', logout); // 👈 Added middleware here
router.post('/logout-all', authenticateToken, logoutAllDevices);
router.post('/switch-account', authenticateToken, validateSwitchAccount, switchAccount);

// Health check route
router.get('/health', (req, res) => {
    res.json({ status: 'Auth service is running' });
});

module.exports = router;