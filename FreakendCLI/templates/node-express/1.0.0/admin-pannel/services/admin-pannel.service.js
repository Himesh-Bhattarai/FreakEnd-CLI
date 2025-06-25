const User = require('../models/User.model');
const AdminLog = require('../models/AdminLog.model');

class AdminService {
  
  async getAllUsers(page = 1, limit = 20, search = '', status = '', role = '') {
    const skip = (page - 1) * limit;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && ['active', 'blocked', 'suspended'].includes(status)) {
      query.status = status;
    }

    if (role && ['user', 'viewer', 'moderator', 'admin', 'superadmin'].includes(role)) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit,
        totalRecords: total
      }
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-password')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async createUser(userData, adminId) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = new User({
      ...userData,
      createdBy: adminId
    });

    await user.save();
    
    // Log the action
    await this.logAdminAction(adminId, 'CREATE_USER', user._id, userData);
    
    return await this.getUserById(user._id);
  }

  async updateUser(userId, updateData, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent updating sensitive fields directly
    delete updateData.password;
    delete updateData.role;
    delete updateData.status;
    
    updateData.updatedBy = adminId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Log the action
    await this.logAdminAction(adminId, 'UPDATE_USER', userId, updateData);

    return updatedUser;
  }

  async deleteUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'superadmin') {
      throw new Error('Cannot delete superadmin user');
    }

    await User.findByIdAndDelete(userId);
    
    // Log the action
    await this.logAdminAction(adminId, 'DELETE_USER', userId, { deletedUser: user.email });

    return { message: 'User deleted successfully' };
  }

  async updateUserStatus(userId, status, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'superadmin') {
      throw new Error('Cannot modify superadmin status');
    }

    user.status = status;
    user.updatedBy = adminId;
    await user.save();

    const actionMap = {
      'blocked': 'BLOCK_USER',
      'suspended': 'SUSPEND_USER',
      'active': 'REACTIVATE_USER'
    };

    // Log the action
    await this.logAdminAction(adminId, actionMap[status], userId, { status });

    return await this.getUserById(userId);
  }

  async assignRole(userId, newRole, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    user.updatedBy = adminId;
    await user.save();

    // Log the action
    await this.logAdminAction(adminId, 'ASSIGN_ROLE', userId, { 
      oldRole, 
      newRole 
    });

    return await this.getUserById(userId);
  }

  async logAdminAction(adminId, action, targetUserId = null, details = {}) {
    try {
      await AdminLog.create({
        adminId,
        action,
        targetUserId,
        details
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  async getAdminLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const total = await AdminLog.countDocuments();
    const logs = await AdminLog.find()
      .populate('adminId', 'name email')
      .populate('targetUserId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    return {
      logs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit,
        totalRecords: total
      }
    };
  }
}

module.exports = new AdminService();