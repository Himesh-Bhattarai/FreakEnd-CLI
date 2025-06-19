const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo, checkAccess } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/roles.config');

// Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.use(protect);

// Basic user routes
router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// User profile routes with RBAC
router.get(
  '/:id',
  checkAccess('read:own_profile'), // Specific permission check
  userController.getUserProfile
);

router.patch(
  '/:id',
  checkAccess('update:own_profile'), // Specific permission check
  userController.updateUserProfile
);

// Admin-only routes would be in admin.routes.js

module.exports = router;