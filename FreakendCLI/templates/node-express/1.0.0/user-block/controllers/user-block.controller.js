
const User = require('../models/User'); // Assume User model exists
const { UserBlockUtils } = require('../utils/user-block.utils');

/**
 * Controller class for user block operations
 */
class UserBlockController {
  
  /**
   * Block a user by ID
   * @route PATCH /block/:id
   * @access Admin only
   */
  static async blockUser(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;
      
      // Find target user
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json(
          UserBlockUtils.createErrorResponse('User not found', 404)
        );
      }
      
      // Check if user is already blocked
      if (user.isBlocked) {
        return res.status(400).json(
          UserBlockUtils.createErrorResponse('User is already blocked', 400)
        );
      }
      
      // Prevent admin from blocking themselves
      if (id === adminId) {
        return res.status(400).json(
          UserBlockUtils.createErrorResponse('Cannot block yourself', 400)
        );
      }
      
      // Block the user
      await user.blockUser(adminId, reason);
      
      // Log the action
      UserBlockUtils.logBlockAction('block', id, adminId, reason);
      
      // Return success response
      res.status(200).json(
        UserBlockUtils.formatBlockResponse(user, 'blocked')
      );
      
    } catch (error) {
      UserBlockUtils.logError(error, 'block_user', { 
        targetUserId: req.params.id,
        adminId: req.user?.id 
      });
      
      res.status(500).json(
        UserBlockUtils.createErrorResponse(
          'Failed to block user',
          500,
          error.message
        )
      );
    }
  }
  
  /**
   * Unblock a user by ID
   * @route PATCH /unblock/:id
   * @access Admin only
   */
  static async unblockUser(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;
      
      // Find target user
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json(
          UserBlockUtils.createErrorResponse('User not found', 404)
        );
      }
      
      // Check if user is actually blocked
      if (!user.isBlocked) {
        return res.status(400).json(
          UserBlockUtils.createErrorResponse('User is not blocked', 400)
        );
      }
      
      // Unblock the user
      await user.unblockUser(adminId, reason);
      
      // Log the action
      UserBlockUtils.logBlockAction('unblock', id, adminId, reason);
      
      // Return success response
      res.status(200).json(
        UserBlockUtils.formatBlockResponse(user, 'unblocked')
      );
      
    } catch (error) {
      UserBlockUtils.logError(error, 'unblock_user', { 
        targetUserId: req.params.id,
        adminId: req.user?.id 
      });
      
      res.status(500).json(
        UserBlockUtils.createErrorResponse(
          'Failed to unblock user',
          500,
          error.message
        )
      );
    }
  }
  
  /**
   * Get list of all blocked users
   * @route GET /blocked
   * @access Admin only
   */
  static async getBlockedUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;
      
      // Build query
      let query = { isBlocked: true };
      
      // Add search functionality
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute query with pagination
      const [users, totalCount] = await Promise.all([
        User.find(query)
          .select('_id username email isBlocked blockedAt blockedBy blockReason')
          .populate('blockedBy', 'username email')
          .sort({ blockedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      res.status(200).json({
        success: true,
        message: 'Blocked users retrieved successfully',
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers: totalCount,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      UserBlockUtils.logError(error, 'get_blocked_users', { 
        adminId: req.user?.id 
      });
      
      res.status(500).json(
        UserBlockUtils.createErrorResponse(
          'Failed to retrieve blocked users',
          500,
          error.message
        )
      );
    }
  }
  
  /**
   * Get user block history
   * @route GET /block-history/:id
   * @access Admin only
   */
  static async getUserBlockHistory(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id)
        .select('_id username email blockHistory')
        .populate('blockHistory.adminId', 'username email');
      
      if (!user) {
        return res.status(404).json(
          UserBlockUtils.createErrorResponse('User not found', 404)
        );
      }
      
      res.status(200).json({
        success: true,
        message: 'User block history retrieved successfully',
        data: {
          userId: user._id,
          username: user.username,
          email: user.email,
          blockHistory: user.blockHistory.sort((a, b) => b.timestamp - a.timestamp)
        }
      });
      
    } catch (error) {
      UserBlockUtils.logError(error, 'get_user_block_history', { 
        targetUserId: req.params.id,
        adminId: req.user?.id 
      });
      
      res.status(500).json(
        UserBlockUtils.createErrorResponse(
          'Failed to retrieve user block history',
          500,
          error.message
        )
      );
    }
  }
}

module.exports = UserBlockController;