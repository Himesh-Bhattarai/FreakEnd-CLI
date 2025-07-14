const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  interval: {
    type: String,
    enum: ['month', 'year', 'one-time'],
    default: 'month'
  },
  features: [{
    name: String,
    description: String,
    limit: Number // -1 for unlimited
  }],
  limitations: {
    maxUsers: { type: Number, default: -1 },
    maxStorage: { type: Number, default: -1 }, // in MB
    maxApiCalls: { type: Number, default: -1 }
  },
  stripeProductId: String,
  stripePriceId: String,
  razorpayPlanId: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  trialDays: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

subscriptionPlanSchema.index({ name: 1 });
subscriptionPlanSchema.index({ price: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);