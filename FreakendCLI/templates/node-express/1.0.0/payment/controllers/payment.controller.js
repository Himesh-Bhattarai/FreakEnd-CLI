const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment.model');
const Subscription = require('../models/subscription.model');
const { createCustomer, formatAmount } = require('../utils/payment.utils');

class PaymentController {
  // Create payment intent
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'usd', description, metadata = {} } = req.body;
      const userId = req.user.id;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Create or get Stripe customer
      const customer = await createCustomer(userId, req.user.email, req.user.name);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: formatAmount(amount, currency),
        currency: currency.toLowerCase(),
        customer: customer.id,
        description,
        metadata: {
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Save payment record
      const payment = new Payment({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customer.id,
        amount: formatAmount(amount, currency),
        currency: currency.toLowerCase(),
        description,
        metadata,
        status: 'pending'
      });

      await payment.save();

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        }
      });
    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: error.message
      });
    }
  }

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { userId };
      if (status) query.status = status;

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'name email');

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment history',
        error: error.message
      });
    }
  }

  // Get single payment
  async getPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findOne({
        _id: paymentId,
        userId
      }).populate('userId', 'name email');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment',
        error: error.message
      });
    }
  }

  // Refund payment
  async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;
      const userId = req.user.id;

      const payment = await Payment.findOne({
        _id: paymentId,
        userId
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (!payment.canRefund()) {
        return res.status(400).json({
          success: false,
          message: 'Payment cannot be refunded'
        });
      }

      // Calculate refund amount
      const refundAmount = amount || (payment.amount - payment.refundAmount);
      
      if (refundAmount > (payment.amount - payment.refundAmount)) {
        return res.status(400).json({
          success: false,
          message: 'Refund amount exceeds refundable amount'
        });
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount,
        reason: reason || 'requested_by_customer'
      });

      // Update payment record
      payment.refundAmount += refundAmount;
      payment.refundReason = reason;
      if (payment.refundAmount >= payment.amount) {
        payment.status = 'refunded';
      }

      await payment.save();

      res.json({
        success: true,
        data: {
          refund,
          payment
        }
      });
    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refund payment',
        error: error.message
      });
    }
  }

  // Create subscription
  async createSubscription(req, res) {
    try {
      const { priceId, planName, planType, trialDays = 0 } = req.body;
      const userId = req.user.id;

      // Create or get Stripe customer
      const customer = await createCustomer(userId, req.user.email, req.user.name);

      const subscriptionData = {
        customer: customer.id,
        items: [{ price: priceId }],
        metadata: {
          userId,
          planName,
          planType
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      };

      if (trialDays > 0) {
        subscriptionData.trial_period_days = trialDays;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      // Save subscription record
      const subscriptionRecord = new Subscription({
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        stripePriceId: priceId,
        status: subscription.status,
        planName,
        planType,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.items.data[0].price.currency,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      });

      await subscriptionRecord.save();

      res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice.payment_intent?.client_secret,
          status: subscription.status
        }
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: error.message
      });
    }
  }

  // Get user subscriptions
  async getSubscriptions(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const query = { userId };
      if (status) query.status = status;

      const subscriptions = await Subscription.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');

      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscriptions',
        error: error.message
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const { cancelAtPeriodEnd = true } = req.body;
      const userId = req.user.id;

      const subscriptionRecord = await Subscription.findOne({
        _id: subscriptionId,
        userId
      });

      if (!subscriptionRecord) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Cancel in Stripe
      let stripeSubscription;
      if (cancelAtPeriodEnd) {
        stripeSubscription = await stripe.subscriptions.update(
          subscriptionRecord.stripeSubscriptionId,
          { cancel_at_period_end: true }
        );
      } else {
        stripeSubscription = await stripe.subscriptions.cancel(
          subscriptionRecord.stripeSubscriptionId
        );
      }

      // Update subscription record
      subscriptionRecord.cancelAtPeriodEnd = cancelAtPeriodEnd;
      subscriptionRecord.status = stripeSubscription.status;
      if (!cancelAtPeriodEnd) {
        subscriptionRecord.canceledAt = new Date();
      }

      await subscriptionRecord.save();

      res.json({
        success: true,
        data: subscriptionRecord
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription',
        error: error.message
      });
    }
  }

  // Handle Stripe webhooks
  async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: 'Webhook signature verification failed'
        });
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook handler error',
        error: error.message
      });
    }
  }

  // Webhook handlers
  async handlePaymentIntentSucceeded(paymentIntent) {
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { 
        status: 'succeeded',
        receiptUrl: paymentIntent.receipt_url
      }
    );
  }

  async handlePaymentIntentFailed(paymentIntent) {
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'failed' }
    );
  }

  async handleInvoicePaymentSucceeded(invoice) {
    if (invoice.subscription) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: invoice.subscription },
        { 
          status: 'active',
          invoiceUrl: invoice.hosted_invoice_url
        }
      );
    }
  }

  async handleSubscriptionUpdated(subscription) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
      }
    );
  }

  async handleSubscriptionDeleted(subscription) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'canceled',
        canceledAt: new Date()
      }
    );
  }
}

module.exports = new PaymentController();