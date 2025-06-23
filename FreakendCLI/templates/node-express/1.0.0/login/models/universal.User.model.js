const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  // Core Identity
  name: {
    type: String,
    trim: true,
    required: false,// Optional for universal user model
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },

  // Authentication
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    required: false, // Optional for universal user model
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Security Tokens
  refreshTokens: [{
    token: String,
    expires: Date
  }],
  tokenVersion: {
    type: String,
    default: () => require('crypto').randomBytes(16).toString('hex')
  },

  // Account Status
  active: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);