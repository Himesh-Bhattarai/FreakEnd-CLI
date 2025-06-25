const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyAdmin = require('../middleware/verifyAdmin');
const requireRole = require('../middleware/requireRole');
const rateLimit = require('express-rate-limit');

// Rate limiting for sensitive operations
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    timestamp: new Date().toISOString()
  }
});

const moderateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    timestamp: new Date().toISOString()
  }
});

// All routes require admin authentication
router.use(verifyAdmin);

// User CRUD operations
router.get('/users', moderateRateLimit, adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', requireRole(['superadmin']), strictRateLimit, adminController.createUser);
router.put('/users/:id', requireRole(['admin', 'superadmin']), adminController.updateUser);
router.delete('/users/:id', requireRole(['superadmin']), strictRateLimit, adminController.deleteUser);

// User status management
router.patch('/users/:id/block', requireRole(['admin', 'superadmin']), strictRateLimit, adminController.blockUser);
router.patch('/users/:id/suspend', requireRole(['admin', 'superadmin']), strictRateLimit, adminController.suspendUser);
router.patch('/users/:id/reactivate', requireRole(['admin', 'superadmin']), adminController.reactivateUser);

// Role assignment (superadmin only)
router.patch('/users/:id/role', requireRole(['superadmin']), strictRateLimit, adminController.assignRole);

// Admin logs (superadmin and admin only)
router.get('/logs', requireRole(['admin', 'superadmin']), adminController.getAdminLogs);

module.exports = router;
