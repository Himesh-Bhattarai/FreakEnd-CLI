const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
});

// Index for efficient querying
otpSchema.index({ phoneNumber: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 });

// Hash OTP before saving
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otpHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.otpHash = await bcrypt.hash(this.otpHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify OTP
otpSchema.methods.verifyOTP = async function(plainOTP) {
  return await bcrypt.compare(plainOTP, this.otpHash);
};

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if max attempts reached
otpSchema.methods.isMaxAttemptsReached = function() {
  return this.attempts >= 3;
};

const smsRateLimitSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  windowStart: {
    type: Date,
    default: Date.now
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  }
});

// TTL index for automatic cleanup
smsRateLimitSchema.index({ 
  lastAttempt: 1 
}, { 
  expireAfterSeconds: 24 * 60 * 60 // 24 hours
});

const OTP = mongoose.model('OTP', otpSchema);
const SMSRateLimit = mongoose.model('SMSRateLimit', smsRateLimitSchema);

module.exports = {
  OTP,
  SMSRateLimit
};