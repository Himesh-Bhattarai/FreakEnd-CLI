const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  // Core Identity
  username: {
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
  tokenVersion: {
    type: Number,
    default: 0  // Changed from string to number
  },
  refreshTokens: [{
    token: String,
    expires: Date,
    createdByIp: String,  // ADD THIS
    createdAt: Date       // ADD THIS
  }],

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