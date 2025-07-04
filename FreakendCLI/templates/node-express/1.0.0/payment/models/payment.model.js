const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'wallet']
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: {
    type: String,
    trim: true
  },
  invoiceUrl: {
    type: String
  },
  receiptUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for net amount (amount - refund)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.refundAmount;
});

// Method to check if payment can be refunded
paymentSchema.methods.canRefund = function() {
  return this.status === 'succeeded' && this.refundAmount < this.amount;
};

module.exports = mongoose.model('Payment', paymentSchema);