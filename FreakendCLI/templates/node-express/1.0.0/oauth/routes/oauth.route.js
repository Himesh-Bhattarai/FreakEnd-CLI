const express = require('express');
const router = express.Router();
const OAuthController = require('../controllers/oauth.controller');
const { 
  authenticateToken, 
  requireOAuthProvider, 
  rateLimitOAuth,
  validateOAuthState,
  sanitizeRedirectURL,
  logOAuthActivity,
  requireEmailVerification
} = require('../middleware/oauth.middleware');

// Apply rate limiting to all OAuth routes
router.use(rateLimitOAuth());

// Apply activity logging
router.use(logOAuthActivity);

// Public OAuth routes
router.get('/:provider', sanitizeRedirectURL, OAuthController.initiateAuth);
router.get('/:provider/callback', validateOAuthState, OAuthController.handleCallback);

// Protected routes - require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', OAuthController.getProfile);
router.put('/profile', OAuthController.updateProfile);

// OAuth provider management
router.get('/connections', OAuthController.getConnections);
router.post('/link/:provider', OAuthController.linkProvider);
router.delete('/unlink/:provider', OAuthController.unlinkProvider);

// Token management
router.post('/refresh', OAuthController.refreshToken);

// Account management
router.delete('/account', requireEmailVerification, OAuthController.deleteAccount);

// Admin routes (add proper admin middleware in production)
router.get('/admin/stats', OAuthController.getStats);

module.exports = router;