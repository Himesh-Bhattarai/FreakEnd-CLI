const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'trial', 'past_due', 'unpaid'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  trialStartDate: Date,
  trialEndDate: Date,
  isTrialUsed: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'manual', 'free'],
    default: 'free'
  },
  paymentDetails: {
    subscriptionId: String, // Stripe/Razorpay subscription ID
    customerId: String, // Stripe/Razorpay customer ID
    paymentMethodId: String,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    amount: Number,
    currency: String
  },
  usage: {
    apiCalls: { type: Number, default: 0 },
    storage: { type: Number, default: 0 }, // in MB
    users: { type: Number, default: 0 }
  },
  canceledAt: Date,
  cancelReason: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Virtual for checking if subscription is expired
subscriptionSchema.virtual('isExpired').get(function() {
  return this.endDate < new Date();
});

// Virtual for checking if in trial period
subscriptionSchema.virtual('isInTrial').get(function() {
  return this.trialEndDate && this.trialEndDate > new Date();
});

// Pre-save middleware to update status based on dates
subscriptionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'active' && this.endDate <= now) {
    this.status = 'expired';
  }
  
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);