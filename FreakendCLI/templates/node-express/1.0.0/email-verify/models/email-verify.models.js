const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  verificationToken: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationAttempts: {
    type: Number,
    default: 0,
    max: 5
  },
  lastVerificationAttempt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailVerificationSchema.index({ verificationToken: 1 });
emailVerificationSchema.index({ email: 1 });
emailVerificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to update expiration
emailVerificationSchema.pre('save', function(next) {
  if (this.isModified('verificationAttempts') && !this.isNew) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to check if verification is expired
emailVerificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to check if max attempts reached
emailVerificationSchema.methods.hasMaxAttemptsReached = function() {
  return this.verificationAttempts >= 5;
};

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);