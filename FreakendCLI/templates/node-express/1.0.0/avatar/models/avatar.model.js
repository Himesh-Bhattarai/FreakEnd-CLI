const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  size: {
    type: Number,
    required: true
  },
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  url: {
    type: String,
    required: true
  },
  storageType: {
    type: String,
    enum: ['local', 's3'],
    default: 'local'
  },
  s3Key: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for efficient queries
avatarSchema.index({ userId: 1, isActive: 1 });

// Virtual for public URL
avatarSchema.virtual('publicUrl').get(function() {
  if (this.storageType === 's3') {
    return this.url;
  }
  return `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/avatars/${this.filename}`;
});

// Ensure virtual fields are serialized
avatarSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Avatar', avatarSchema);