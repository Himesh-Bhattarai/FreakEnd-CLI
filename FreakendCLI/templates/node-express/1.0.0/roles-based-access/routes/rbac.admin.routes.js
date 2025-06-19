const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/roles.config');

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Content management
router.get('/content', adminController.getAllContent);
router.delete('/content/:id', adminController.deleteAnyContent);

// Super admin only routes
router.use(restrictTo(ROLES.SUPER_ADMIN));
router.patch('/system-settings', adminController.updateSystemSettings);
router.post('/roles', adminController.createRole);

module.exports = router;