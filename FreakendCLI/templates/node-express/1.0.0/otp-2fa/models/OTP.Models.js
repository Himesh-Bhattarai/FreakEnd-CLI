const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const otpSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      private: true
    },
    identifier: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['sms', 'email', 'totp'],
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    metadata: {
      ip: String,
      userAgent: String
    }
  },
  {
    timestamps: true,
    expireAfterSeconds: 3600 // Auto-delete after 1 hour
  }
);

// Index for faster lookups
otpSchema.index({ identifier: 1, type: 1 });

otpSchema.plugin(toJSON);

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;