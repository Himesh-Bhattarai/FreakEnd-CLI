const mongoose = require('mongoose');

// Main Analytics Schema for aggregated data
const analyticsSchema = new mongoose.Schema({
  // Route Analytics
  route: {
    type: String,
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  },
  
  // Time-based metrics
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  hour: {
    type: Number,
    min: 0,
    max: 23,
    required: true
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    required: true
  },
  
  // Performance metrics
  totalRequests: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0
  },
  successfulRequests: {
    type: Number,
    default: 0
  },
  failedRequests: {
    type: Number,
    default: 0
  },
  
  // Status code breakdown
  statusCodes: {
    '200': { type: Number, default: 0 },
    '201': { type: Number, default: 0 },
    '400': { type: Number, default: 0 },
    '401': { type: Number, default: 0 },
    '403': { type: Number, default: 0 },
    '404': { type: Number, default: 0 },
    '500': { type: Number, default: 0 }
  },
  
  // User analytics
  uniqueUsers: {
    type: Number,
    default: 0
  },
  authenticatedRequests: {
    type: Number,
    default: 0
  },
  
  // Geographic data
  countries: [{
    country: String,
    count: Number
  }],
  
  // Device/Browser analytics
  userAgents: [{
    agent: String,
    count: Number
  }],
  
  // Custom metrics
  customMetrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'analytics'
});

// Compound indexes for better query performance
analyticsSchema.index({ route: 1, date: 1 });
analyticsSchema.index({ date: 1, hour: 1 });
analyticsSchema.index({ method: 1, date: 1 });

// Static methods for analytics operations
analyticsSchema.statics.getRouteStats = async function(route, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        route: route,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: '$totalRequests' },
        averageResponseTime: { $avg: '$averageResponseTime' },
        successRate: {
          $avg: {
            $divide: ['$successfulRequests', '$totalRequests']
          }
        }
      }
    }
  ]);
};

analyticsSchema.statics.getTopRoutes = async function(limit = 10) {
  return await this.aggregate([
    {
      $group: {
        _id: '$route',
        totalRequests: { $sum: '$totalRequests' },
        averageResponseTime: { $avg: '$averageResponseTime' }
      }
    },
    { $sort: { totalRequests: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);