const mongoose = require('mongoose');

// Real-time event tracking schema
const analyticsEventSchema = new mongoose.Schema({
  // Event identification
  eventType: {
    type: String,
    required: true,
    enum: ['route_access', 'user_action', 'error', 'performance', 'custom']
  },
  eventName: {
    type: String,
    required: true
  },
  
  // Request details
  route: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    default: null
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  
  // Request metadata
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  
  // Performance metrics
  memoryUsage: {
    type: Number,
    default: null
  },
  cpuUsage: {
    type: Number,
    default: null
  },
  
  // Custom event data
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Error details (if applicable)
  error: {
    message: String,
    stack: String,
    code: String
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'analytics_events'
});

// TTL index to automatically delete events older than 30 days
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Indexes for common queries
analyticsEventSchema.index({ eventType: 1, timestamp: 1 });
analyticsEventSchema.index({ route: 1, timestamp: 1 });
analyticsEventSchema.index({ userId: 1, timestamp: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);