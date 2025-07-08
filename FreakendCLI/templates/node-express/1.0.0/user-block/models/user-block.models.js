const mongoose = require('mongoose');

/**
 * User Block Schema Extension
 * Adds blocking functionality to existing user schema
 */
const userBlockSchema = new mongoose.Schema({
  isBlocked: {
    type: Boolean,
    default: false,
    index: true // Index for efficient queries
  },
  blockedAt: {
    type: Date,
    default: null
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  blockReason: {
    type: String,
    default: null,
    maxlength: 500
  },
  unblockReason: {
    type: String,
    default: null,
    maxlength: 500
  },
  blockHistory: [{
    action: {
      type: String,
      enum: ['blocked', 'unblocked'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      maxlength: 500
    }
  }]
}, {
  timestamps: true
});

/**
 * Static method to get all blocked users
 * @returns {Promise<Array>} Array of blocked users
 */
userBlockSchema.statics.getBlockedUsers = async function() {
  try {
    return await this.find({ isBlocked: true })
      .select('_id username email isBlocked blockedAt blockedBy blockReason')
      .populate('blockedBy', 'username email')
      .sort({ blockedAt: -1 });
  } catch (error) {
    throw new Error(`Failed to fetch blocked users: ${error.message}`);
  }
};

/**
 * Instance method to block user
 * @param {string} adminId - ID of admin blocking the user
 * @param {string} reason - Reason for blocking
 * @returns {Promise<Object>} Updated user document
 */
userBlockSchema.methods.blockUser = async function(adminId, reason = null) {
  try {
    this.isBlocked = true;
    this.blockedAt = new Date();
    this.blockedBy = adminId;
    this.blockReason = reason;
    
    // Add to block history
    this.blockHistory.push({
      action: 'blocked',
      adminId: adminId,
      reason: reason
    });
    
    return await this.save();
  } catch (error) {
    throw new Error(`Failed to block user: ${error.message}`);
  }
};

/**
 * Instance method to unblock user
 * @param {string} adminId - ID of admin unblocking the user
 * @param {string} reason - Reason for unblocking
 * @returns {Promise<Object>} Updated user document
 */
userBlockSchema.methods.unblockUser = async function(adminId, reason = null) {
  try {
    this.isBlocked = false;
    this.blockedAt = null;
    this.blockedBy = null;
    this.blockReason = null;
    this.unblockReason = reason;
    
    // Add to block history
    this.blockHistory.push({
      action: 'unblocked',
      adminId: adminId,
      reason: reason
    });
    
    return await this.save();
  } catch (error) {
    throw new Error(`Failed to unblock user: ${error.message}`);
  }
};

module.exports = userBlockSchema;