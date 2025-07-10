const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const oauthUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  oauthProviders: [{
    provider: {
      type: String,
      enum: ['github', 'facebook', 'google'],
      required: true
    },
    providerId: {
      type: String,
      required: true
    },
    providerData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      }
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
oauthUserSchema.index({ email: 1 });
oauthUserSchema.index({ username: 1 });
oauthUserSchema.index({ 'oauthProviders.provider': 1, 'oauthProviders.providerId': 1 });
oauthUserSchema.index({ lastLogin: -1 });

// Virtual for full avatar URL
oauthUserSchema.virtual('avatarUrl').get(function() {
  if (this.avatar) {
    return this.avatar.startsWith('http') ? this.avatar : `${process.env.BASE_URL}/uploads/${this.avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName)}&background=random`;
});

// Method to add OAuth provider
oauthUserSchema.methods.addOAuthProvider = function(provider, providerId, providerData) {
  const existingProvider = this.oauthProviders.find(p => p.provider === provider);
  
  if (existingProvider) {
    existingProvider.providerId = providerId;
    existingProvider.providerData = providerData;
    existingProvider.connectedAt = new Date();
  } else {
    this.oauthProviders.push({
      provider,
      providerId,
      providerData,
      connectedAt: new Date()
    });
  }
};

// Method to remove OAuth provider
oauthUserSchema.methods.removeOAuthProvider = function(provider) {
  this.oauthProviders = this.oauthProviders.filter(p => p.provider !== provider);
};

// Method to check if user has specific OAuth provider
oauthUserSchema.methods.hasOAuthProvider = function(provider) {
  return this.oauthProviders.some(p => p.provider === provider);
};

// Method to update login stats
oauthUserSchema.methods.updateLoginStats = function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.metadata.ipAddress = ipAddress;
  this.metadata.userAgent = userAgent;
};

// Static method to find user by OAuth provider
oauthUserSchema.statics.findByOAuthProvider = function(provider, providerId) {
  return this.findOne({
    'oauthProviders.provider': provider,
    'oauthProviders.providerId': providerId
  });
};

// Pre-save middleware
oauthUserSchema.pre('save', function(next) {
  // Update email verification status for OAuth providers
  if (this.oauthProviders.length > 0 && !this.isEmailVerified) {
    this.isEmailVerified = true;
  }
  next();
});

const OAuthUser = mongoose.model('OAuthUser', oauthUserSchema);

module.exports = OAuthUser;