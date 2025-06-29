const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Content ID is required'],
    index: true
  },
  reactionType: {
    type: String,
    required: [true, 'Reaction type is required'],
    enum: {
      values: ['like', 'dislike', '❤️', '🔥', '😢', '😂', '👍', '👎', '😍', '😮'],
      message: 'Invalid reaction type'
    },
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one reaction per user per content
reactionSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Index for efficient querying by content
reactionSchema.index({ contentId: 1, reactionType: 1 });

// Update the updatedAt field before saving
reactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get reaction stats for content
reactionSchema.statics.getReactionStats = async function(contentId) {
  const stats = await this.aggregate([
    { $match: { contentId: mongoose.Types.ObjectId(contentId) } },
    { $group: { _id: '$reactionType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

// Static method to check if user has reacted to content
reactionSchema.statics.getUserReaction = async function(userId, contentId) {
  return await this.findOne({ userId, contentId });
};

module.exports = mongoose.model('Reaction', reactionSchema);