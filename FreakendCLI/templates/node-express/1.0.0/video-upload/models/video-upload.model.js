const mongoose = require('mongoose');

const videoUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalFilename: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  category: {
    type: String,
    enum: ['education', 'entertainment', 'business', 'technology', 'health', 'sports', 'music', 'other'],
    default: 'other'
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  resolution: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  format: {
    type: String,
    required: true
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'ultra'],
    default: 'medium'
  },
  s3Key: {
    type: String,
    required: true
  },
  s3Url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  thumbnailS3Key: {
    type: String
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    codec: String,
    bitrate: Number,
    fps: Number,
    aspectRatio: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
videoUploadSchema.index({ userId: 1, createdAt: -1 });
videoUploadSchema.index({ category: 1, privacy: 1 });
videoUploadSchema.index({ tags: 1 });
videoUploadSchema.index({ processingStatus: 1 });
videoUploadSchema.index({ 'metadata.duration': 1 });

// Virtual for formatted duration
videoUploadSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for file size in MB
videoUploadSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Pre-save middleware to generate filename
videoUploadSchema.pre('save', function(next) {
  if (!this.filename) {
    this.filename = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('VideoUpload', videoUploadSchema);
