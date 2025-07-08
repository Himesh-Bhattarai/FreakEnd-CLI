
const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken } = require('../middleware/auth'); // Assume exists
const { 
  checkUserBlocked, 
  requireAdmin, 
  validateBlockRequest 
} = require('../middleware/user-block.middleware');

// Import controller
const UserBlockController = require('../controllers/user-block.controllers');

/**
 * @route   PATCH /api/user-block/block/:id
 * @desc    Block a user by ID
 * @access  Admin only
 */
router.patch('/block/:id', 
  authenticateToken,
  checkUserBlocked,
  requireAdmin,
  validateBlockRequest,
  UserBlockController.blockUser
);

/**
 * @route   PATCH /api/user-block/unblock/:id
 * @desc    Unblock a user by ID
 * @access  Admin only
 */
router.patch('/unblock/:id',
  authenticateToken,
  checkUserBlocked,
  requireAdmin,
  validateBlockRequest,
  UserBlockController.unblockUser
);

/**
 * @route   GET /api/user-block/blocked
 * @desc    Get list of blocked users
 * @access  Admin only
 */
router.get('/blocked',
  authenticateToken,
  checkUserBlocked,
  requireAdmin,
  UserBlockController.getBlockedUsers
);

/**
 * @route   GET /api/user-block/block-history/:id
 * @desc    Get user block history
 * @access  Admin only
 */
router.get('/block-history/:id',
  authenticateToken,
  checkUserBlocked,
  requireAdmin,
  validateBlockRequest,
  UserBlockController.getUserBlockHistory
);

module.exports = router;