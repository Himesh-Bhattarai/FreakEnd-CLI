const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchType: {
    type: String,
    enum: ['semantic', 'text', 'hybrid'],
    required: true
  },
  resultsCount: {
    type: Number,
    required: true,
    min: 0
  },
  responseTime: {
    type: Number,
    required: true,
    min: 0
  },
  filters: {
    category: String,
    tags: [String],
    dateRange: {
      start: Date,
      end: Date
    }
  },
  clickedResults: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SearchableItem'
    },
    rank: Number,
    clickedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sessionId: {
    type: String,
    required: true
  },
  userAgent: String,
  ipAddress: String
}, {
  timestamps: true
});

// Indexes for analytics queries
searchAnalyticsSchema.index({ userId: 1, createdAt: -1 });
searchAnalyticsSchema.index({ query: 1, createdAt: -1 });
searchAnalyticsSchema.index({ searchType: 1, createdAt: -1 });
searchAnalyticsSchema.index({ sessionId: 1 });

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema);