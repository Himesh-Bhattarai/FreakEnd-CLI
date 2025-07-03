import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Post ID is required'],
    index: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
  match: { isDeleted: false }
});

// Indexes for performance
commentSchema.index({ postId: 1, parentCommentId: 1 });
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

// Pre-save middleware
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.editedAt = new Date();
  }
  next();
});

// Instance method to soft delete
commentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to find active comments
commentSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

// Static method to get comment tree
commentSchema.statics.getCommentTree = function(postId) {
  return this.aggregate([
    {
      $match: {
        postId: new mongoose.Types.ObjectId(postId),
        isDeleted: false
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$author'
    },
    {
      $sort: { createdAt: 1 }
    }
  ]);
};

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;