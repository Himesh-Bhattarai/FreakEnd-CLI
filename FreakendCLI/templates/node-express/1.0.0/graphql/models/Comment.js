// templates/node-express/1.0.0/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required'],
    index: true
  },
  
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Comment must belong to a post'],
    index: true
  },
  
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date
  },
  
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'other']
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ moderationStatus: 1 });

// Virtual for like count
commentSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for replies count
commentSchema.virtual('repliesCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Pre-save middleware
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Static methods
commentSchema.statics.findByPost = function(postId, options = {}) {
  const query = { 
    post: postId, 
    isDeleted: false,
    moderationStatus: 'approved'
  };
  
  if (options.parentOnly) {
    query.parentComment = null;
  }
  
  return this.find(query)
    .populate('author', 'username avatar')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

commentSchema.statics.findReplies = function(parentCommentId) {
  return this.find({ 
    parentComment: parentCommentId,
    isDeleted: false,
    moderationStatus: 'approved'
  })
    .populate('author', 'username avatar')
    .sort({ createdAt: 1 });
};

commentSchema.statics.findByAuthor = function(authorId) {
  return this.find({ 
    author: authorId,
    isDeleted: false 
  })
    .populate('post', 'title slug')
    .sort({ createdAt: -1 });
};

// Instance methods
commentSchema.methods.like = function(userId) {
  const isLiked = this.likes.some(like => like.user.toString() === userId.toString());
  
  if (!isLiked) {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

commentSchema.methods.unlike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

commentSchema.methods.isLikedBy = function(userId) {
  if (!userId) return false;
  return this.likes.some(like => like.user.toString() === userId.toString());
};

commentSchema.methods.flag = function(userId, reason) {
  const alreadyFlagged = this.flags.some(flag => flag.user.toString() === userId.toString());
  
  if (!alreadyFlagged) {
    this.flags.push({ user: userId, reason });
    
    // Auto-flag for moderation if multiple flags
    if (this.flags.length >= 3) {
      this.moderationStatus = 'flagged';
    }
  }
  
  return this.save();
};

commentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = '[Comment deleted]';
  return this.save();
};

commentSchema.methods.canEdit = function(userId, timeLimit = 15) {
  // Check if user is the author
  if (this.author.toString() !== userId.toString()) {
    return false;
  }
  
  // Check time limit (default 15 minutes)
  const timeLimitMs = timeLimit * 60 * 1000;
  const now = new Date();
  const createdAt = new Date(this.createdAt);
  
  return (now - createdAt) < timeLimitMs;
};

commentSchema.methods.canDelete = function(userId) {
  return this.author.toString() === userId.toString();
};

module.exports = mongoose.model('Comment', commentSchema);