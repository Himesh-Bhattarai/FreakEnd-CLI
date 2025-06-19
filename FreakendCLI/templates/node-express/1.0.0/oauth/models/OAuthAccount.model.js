const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const oauthAccountSchema = mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ['google', 'facebook', 'github', 'custom']
    },
    providerId: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true,
      private: true
    },
    refreshToken: {
      type: String,
      private: true
    },
    expiresAt: {
      type: Date
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one account per provider per user
oauthAccountSchema.index({ provider: 1, user: 1 }, { unique: true });

oauthAccountSchema.plugin(toJSON);

const OAuthAccount = mongoose.model('OAuthAccount', oauthAccountSchema);

module.exports = OAuthAccount;