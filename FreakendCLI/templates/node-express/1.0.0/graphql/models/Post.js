// templates/node-express/1.0.0/models/Post.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Post content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  
  featuredImage: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Featured image must be a valid image URL'
    }
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post author is required'],
    index: true
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
  
  views: {
    type: Number,
    default: 0
  },
  
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  
  publishedAt: {
    type: Date
  },
  
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ slug: 1 });
postSchema.index({ title: 'text', content: 'text' });

// Virtual for like count
postSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count (will be populated by resolver)
postSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Calculate read time based on content
postSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Generate excerpt if not provided
postSchema.methods.generateExcerpt = function() {
  if (this.excerpt) return this.excerpt;
  
  // Remove HTML tags and get first 150 characters
  const plainContent = this.content.replace(/<[^>]*>/g, '');
  return plainContent.length > 150 
    ? plainContent.substring(0, 150).trim() + '...'
    : plainContent;
};

// Pre-save middleware
postSchema.pre('save', async function(next) {
  try {
    // Generate slug if title is modified
    if (this.isModified('title')) {
      let baseSlug = slugify(this.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      // Ensure slug uniqueness
      let slug = baseSlug;
      let counter = 1;
      
      while (await this.constructor.findOne({ 
        slug, 
        _id: { $ne: this._id } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = slug;
    }
    
    // Calculate read time
    if (this.isModified('content')) {
      this.readTime = this.calculateReadTime();
    }
    
    // Generate excerpt if not provided
    if (this.isModified('content') && !this.excerpt) {
      this.excerpt = this.generateExcerpt();
    }
    
    // Set publishedAt when status changes to PUBLISHED
    if (this.isModified('status') && this.status === 'PUBLISHED' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    
    // Generate SEO fields if not provided
    if (!this.seo.metaTitle) {
      this.seo.metaTitle = this.title.length > 60 
        ? this.title.substring(0, 57) + '...'
        : this.title;
    }
    
    if (!this.seo.metaDescription) {
      this.seo.metaDescription = this.generateExcerpt();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static methods
postSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'PUBLISHED',
    isDeleted: false 
  }).sort({ publishedAt: -1 });
};

postSchema.statics.findByAuthor = function(authorId) {
  return this.find({ 
    author: authorId,
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

postSchema.statics.findByTag = function(tag) {
  return this.find({ 
    tags: { $in: [tag.toLowerCase()] },
    status: 'PUBLISHED',
    isDeleted: false 
  }).sort({ publishedAt: -1 });
};

postSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'PUBLISHED',
    isDeleted: false
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

postSchema.statics.getPopularTags = function(limit = 20) {
  return this.aggregate([
    { $match: { status: 'PUBLISHED', isDeleted: false } },
    { $unwind: '$tags' },
    { 
      $group: { 
        _id: '$tags', 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    { 
      $project: { 
        tag: '$_id', 
        count: 1, 
        _id: 0 
      } 
    }
  ]);
};

// Instance methods
postSchema.methods.like = function(userId) {
  const isLiked = this.likes.some(like => like.user.toString() === userId.toString());
  
  if (!isLiked) {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

postSchema.methods.unlike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

postSchema.methods.isLikedBy = function(userId) {
  if (!userId) return false;
  return this.likes.some(like => like.user.toString() === userId.toString());
};

postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

postSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);