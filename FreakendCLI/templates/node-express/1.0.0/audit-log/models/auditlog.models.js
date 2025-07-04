const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userEmail: {
    type: String,
    default: null
  },
  
  // Action Details
  action: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTER',
      'USER_UPDATE_PROFILE',
      'USER_DELETE_ACCOUNT',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'EMAIL_VERIFICATION',
      'API_KEY_CREATED',
      'API_KEY_DELETED',
      'FILE_UPLOAD',
      'FILE_DELETE',
      'PAYMENT_PROCESSED',
      'PAYMENT_FAILED',
      'ADMIN_ACCESS',
      'DATA_EXPORT',
      'DATA_IMPORT',
      'SYSTEM_CONFIG_CHANGE',
      'SECURITY_VIOLATION',
      'CUSTOM'
    ]
  },
  
  // Request Details
  resource: {
    type: String,
    required: true // e.g., '/api/users', '/api/payments'
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  },
  
  // Context Information
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['AUTHENTICATION', 'AUTHORIZATION', 'DATA_MODIFICATION', 'FILE_OPERATION', 'PAYMENT', 'SYSTEM', 'SECURITY']
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  
  // Technical Details
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: null
  },
  statusCode: {
    type: Number,
    required: true
  },
  
  // Additional Data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Error Information (if applicable)
  error: {
    message: String,
    code: String,
    stack: String
  },
  
  // Performance Metrics
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  
  // Data Changes (before/after for updates)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Indexes for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index for automatic cleanup based on retention period
auditLogSchema.index({ 
  timestamp: 1 
}, { 
  expireAfterSeconds: process.env.AUDIT_LOG_RETENTION_DAYS 
    ? parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) * 24 * 60 * 60 
    : 365 * 24 * 60 * 60 
});

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Method to sanitize sensitive data
auditLogSchema.methods.sanitize = function() {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// Static method to clean up old logs
auditLogSchema.statics.cleanup = async function() {
  const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 365;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);