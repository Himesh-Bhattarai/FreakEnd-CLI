const mongoose = require('mongoose');

const searchableItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['article', 'product', 'document', 'faq', 'tutorial', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Embedding vector is required'
    }
  },
  searchScore: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better search performance
searchableItemSchema.index({ category: 1, isActive: 1 });
searchableItemSchema.index({ tags: 1 });
searchableItemSchema.index({ createdBy: 1 });
searchableItemSchema.index({ searchScore: -1 });
searchableItemSchema.index({ createdAt: -1 });

// Text search index
searchableItemSchema.index({
  title: 'text',
  content: 'text',
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('SearchableItem', searchableItemSchema);