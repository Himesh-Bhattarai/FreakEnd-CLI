const mongoose = require('mongoose');

const seederLogSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true,
    enum: ['seed', 'reset', 'clear']
  },
  model: {
    type: String,
    required: true
  },
  recordsAffected: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  error: {
    message: String,
    stack: String
  },
  metadata: {
    batchSize: Number,
    environment: String,
    seedType: String
  }
}, {
  timestamps: true
});

const SeederLog = mongoose.model('SeederLog', seederLogSchema);

module.exports = {
  SeederLog
};