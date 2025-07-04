const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Format amount for Stripe (convert to cents for USD)
const formatAmount = (amount, currency = 'usd') => {
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  return Math.round(amount * 100);
};

// Create or get existing Stripe customer
const createCustomer = async (userId, email, name) => {
  try {
    // First, try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString()
      }
    });

    return customer;
  } catch (error) {
    console.error('Create customer error:', error);
    throw error;
  }
};

// Calculate subscription proration
const calculateProration = async (subscriptionId, newPriceId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const proration = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer,
      subscription: subscriptionId,
      subscription_items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }]
    });

    return {
      proratedAmount: proration.amount_due,
      nextPaymentDate: new Date(proration.period_end * 1000)
    };
  } catch (error) {
    console.error('Calculate proration error:', error);
    throw error;
  }
};

// Validate webhook signature
const validateWebhookSignature = (payload, signature, secret) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Webhook validation error:', error);
    throw error;
  }
};

// Get payment analytics
const getPaymentAnalytics = async (userId, startDate, endDate) => {
  try {
    const Payment = require('../models/payment.model');
    
    const pipeline = [
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$amount' }
        }
      }
    ];

    const result = await Payment.aggregate(pipeline);
    
    return result[0] || {
      totalAmount: 0,
      totalRefunds: 0,
      totalTransactions: 0,
      avgTransactionValue: 0
    };
  } catch (error) {
    console.error('Get payment analytics error:', error);
    throw error;
  }
};

module.exports = {
  formatAmount,
  createCustomer,
  calculateProration,
  validateWebhookSignature,
  getPaymentAnalytics
};