const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  tokens: {
    type: Number,
    default: 0
  },
  metadata: {
    model: String,
    temperature: Number,
    responseTime: Number,
    cost: Number
  }
}, {
  timestamps: true
});

// Index for conversation message retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);