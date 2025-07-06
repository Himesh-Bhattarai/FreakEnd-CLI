const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    model: {
      type: String,
      default: process.env.CHATBOT_DEFAULT_MODEL || 'gpt-3.5-turbo'
    },
    temperature: {
      type: Number,
      default: parseFloat(process.env.CHATBOT_TEMPERATURE) || 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: parseInt(process.env.CHATBOT_MAX_TOKENS) || 150,
      min: 1,
      max: 2000
    }
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
conversationSchema.index({ userId: 1, isActive: 1 });
conversationSchema.index({ lastActivity: -1 });

// Update lastActivity on save
conversationSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);