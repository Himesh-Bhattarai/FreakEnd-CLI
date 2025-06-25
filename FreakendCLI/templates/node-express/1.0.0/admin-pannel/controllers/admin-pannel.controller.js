// controllers/admin.controller.js
const adminService = require('../services/admin-pannel.service');
const sendResponse = require('../utils/admin-pannel.sendResponse');
const Joi = require('joi');

// Validation schemas
const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'viewer', 'moderator', 'admin').default('user')
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().email()
}).min(1);

const roleAssignSchema = Joi.object({
  role: Joi.string().valid('user', 'viewer', 'moderator', 'admin', 'superadmin').required()
});

class AdminController {
  
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '', status = '', role = '' } = req.query;
      
      const result = await adminService.getAllUsers(
        parseInt(page),
        parseInt(limit),
        search,
        status,
        role
      );

      // Log the action
      await adminService.logAdminAction(req.user._id, 'VIEW_USERS');

      return sendResponse.paginated(res, result.users, result.pagination, 'Users retrieved successfully');
    } catch (error) {
      console.error('Get users error:', error);
      return sendResponse.error(res, 'Failed to retrieve users', 500);
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserById(id);
      
      return sendResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      console.error('Get user error:', error);
      return sendResponse.error(res, 'Failed to retrieve user', 500);
    }
  }

  async createUser(req, res) {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        return sendResponse.error(res, 'Validation failed', 400, error.details);
      }

      const user = await adminService.createUser(value, req.user._id);
      
      return sendResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return sendResponse.error(res, error.message, 409);
      }
      console.error('Create user error:', error);
      return sendResponse.error(res, 'Failed to create user', 500);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        return sendResponse.error(res, 'Validation failed', 400, error.details);
      }

      const user = await adminService.updateUser(id, value, req.user._id);
      
      return sendResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      console.error('Update user error:', error);
      return sendResponse.error(res, 'Failed to update user', 500);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      if (id === req.user._id.toString()) {
        return sendResponse.error(res, 'Cannot delete your own account', 400);
      }

      const result = await adminService.deleteUser(id, req.user._id);
      
      return sendResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      if (error.message === 'Cannot delete superadmin user') {
        return sendResponse.error(res, error.message, 403);
      }
      console.error('Delete user error:', error);
      return sendResponse.error(res, 'Failed to delete user', 500);
    }
  }

  async blockUser(req, res) {
    try {
      const { id } = req.params;
      
      if (id === req.user._id.toString()) {
        return sendResponse.error(res, 'Cannot block your own account', 400);
      }

      const user = await adminService.updateUserStatus(id, 'blocked', req.user._id);
      
      return sendResponse.success(res, user, 'User blocked successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      if (error.message === 'Cannot modify superadmin status') {
        return sendResponse.error(res, error.message, 403);
      }
      console.error('Block user error:', error);
      return sendResponse.error(res, 'Failed to block user', 500);
    }
  }

  async suspendUser(req, res) {
    try {
      const { id } = req.params;
      
      if (id === req.user._id.toString()) {
        return sendResponse.error(res, 'Cannot suspend your own account', 400);
      }

      const user = await adminService.updateUserStatus(id, 'suspended', req.user._id);
      
      return sendResponse.success(res, user, 'User suspended successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      if (error.message === 'Cannot modify superadmin status') {
        return sendResponse.error(res, error.message, 403);
      }
      console.error('Suspend user error:', error);
      return sendResponse.error(res, 'Failed to suspend user', 500);
    }
  }

  async reactivateUser(req, res) {
    try {
      const { id } = req.params;
      const user = await adminService.updateUserStatus(id, 'active', req.user._id);
      
      return sendResponse.success(res, user, 'User reactivated successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      console.error('Reactivate user error:', error);
      return sendResponse.error(res, 'Failed to reactivate user', 500);
    }
  }

  async assignRole(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = roleAssignSchema.validate(req.body);
      if (error) {
        return sendResponse.error(res, 'Validation failed', 400, error.details);
      }

      if (id === req.user._id.toString()) {
        return sendResponse.error(res, 'Cannot change your own role', 400);
      }

      const user = await adminService.assignRole(id, value.role, req.user._id);
      
      return sendResponse.success(res, user, 'Role assigned successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse.error(res, 'User not found', 404);
      }
      console.error('Assign role error:', error);
      return sendResponse.error(res, 'Failed to assign role', 500);
    }
  }

  async getAdminLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const result = await adminService.getAdminLogs(
        parseInt(page),
        parseInt(limit)
      );

      return sendResponse.paginated(res, result.logs, result.pagination, 'Admin logs retrieved successfully');
    } catch (error) {
      console.error('Get admin logs error:', error);
      return sendResponse.error(res, 'Failed to retrieve admin logs', 500);
    }
  }
}

module.exports = new AdminController();