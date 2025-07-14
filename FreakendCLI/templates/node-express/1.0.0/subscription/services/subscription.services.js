const Subscription = require('../models/subscription.models');
const SubscriptionPlan = require('../models/subscriptionPlan.models');
const moment = require('moment');

class SubscriptionService {
  constructor(paymentProvider = 'stripe') {
    this.paymentProvider = paymentProvider;
    this.initializePaymentProvider();
  }

  initializePaymentProvider() {
    if (this.paymentProvider === 'stripe') {
      this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    } else if (this.paymentProvider === 'razorpay') {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
  }

  async createSubscription(userId, planId, paymentMethodId = null, useFreeTrial = false) {
    try {
      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trial'] }
      });

      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      let subscriptionData = {
        userId,
        planId,
        startDate: new Date(),
        paymentMethod: plan.isFree ? 'free' : this.paymentProvider
      };

      // Handle free trial
      if (useFreeTrial && plan.trialDays > 0) {
        const existingUser = await Subscription.findOne({ userId, isTrialUsed: true });
        if (existingUser) {
          throw new Error('Free trial already used');
        }

        subscriptionData.status = 'trial';
        subscriptionData.trialStartDate = new Date();
        subscriptionData.trialEndDate = moment().add(plan.trialDays, 'days').toDate();
        subscriptionData.endDate = subscriptionData.trialEndDate;
        subscriptionData.isTrialUsed = true;
      } else {
        subscriptionData.endDate = moment().add(1, plan.interval).toDate();
      }

      // Handle payment for paid plans
      if (!plan.isFree && !useFreeTrial) {
        const paymentResult = await this.processPayment(userId, plan, paymentMethodId);
        subscriptionData.paymentDetails = paymentResult;
      }

      const subscription = new Subscription(subscriptionData);
      await subscription.save();

      return await subscription.populate('planId');
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async processPayment(userId, plan, paymentMethodId) {
    if (this.paymentProvider === 'stripe') {
      return await this.processStripePayment(userId, plan, paymentMethodId);
    } else if (this.paymentProvider === 'razorpay') {
      return await this.processRazorpayPayment(userId, plan, paymentMethodId);
    }
    throw new Error('Payment provider not supported');
  }

  async processStripePayment(userId, plan, paymentMethodId) {
    try {
      // Create or get customer
      const customer = await this.stripe.customers.create({
        metadata: { userId: userId.toString() }
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        default_payment_method: paymentMethodId
      });

      return {
        subscriptionId: subscription.id,
        customerId: customer.id,
        paymentMethodId,
        amount: plan.price,
        currency: plan.currency,
        nextPaymentDate: new Date(subscription.current_period_end * 1000)
      };
    } catch (error) {
      throw new Error(`Stripe payment failed: ${error.message}`);
    }
  }

  async processRazorpayPayment(userId, plan, paymentMethodId) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: plan.razorpayPlanId,
        customer_notify: 1,
        total_count: 12 // Adjust based on plan
      });

      return {
        subscriptionId: subscription.id,
        paymentMethodId,
        amount: plan.price,
        currency: plan.currency
      };
    } catch (error) {
      throw new Error(`Razorpay payment failed: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId, reason = 'User request') {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel with payment provider
      if (subscription.paymentDetails?.subscriptionId) {
        if (this.paymentProvider === 'stripe') {
          await this.stripe.subscriptions.del(subscription.paymentDetails.subscriptionId);
        } else if (this.paymentProvider === 'razorpay') {
          await this.razorpay.subscriptions.cancel(subscription.paymentDetails.subscriptionId);
        }
      }

      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      subscription.cancelReason = reason;
      await subscription.save();

      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async upgradeSubscription(subscriptionId, newPlanId) {
    try {
      const subscription = await Subscription.findById(subscriptionId).populate('planId');
      const newPlan = await SubscriptionPlan.findById(newPlanId);

      if (!subscription || !newPlan) {
        throw new Error('Subscription or plan not found');
      }

      // Update subscription
      subscription.planId = newPlanId;
      subscription.endDate = moment().add(1, newPlan.interval).toDate();
      
      // Handle payment provider update
      if (subscription.paymentDetails?.subscriptionId && !newPlan.isFree) {
        if (this.paymentProvider === 'stripe') {
          await this.stripe.subscriptions.update(subscription.paymentDetails.subscriptionId, {
            items: [{ price: newPlan.stripePriceId }]
          });
        }
      }

      await subscription.save();
      return await subscription.populate('planId');
    } catch (error) {
      throw new Error(`Failed to upgrade subscription: ${error.message}`);
    }
  }

  async renewSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId).populate('planId');
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = subscription.planId;
      subscription.endDate = moment().add(1, plan.interval).toDate();
      subscription.status = 'active';
      
      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error(`Failed to renew subscription: ${error.message}`);
    }
  }

  async checkSubscriptionStatus(userId) {
    try {
      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trial'] }
      }).populate('planId');

      if (!subscription) {
        return { hasActiveSubscription: false, subscription: null };
      }

      // Check if expired
      if (subscription.endDate <= new Date()) {
        subscription.status = 'expired';
        await subscription.save();
        return { hasActiveSubscription: false, subscription };
      }

      return { hasActiveSubscription: true, subscription };
    } catch (error) {
      throw new Error(`Failed to check subscription status: ${error.message}`);
    }
  }

  async updateUsage(subscriptionId, usage) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.usage = { ...subscription.usage, ...usage };
      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error(`Failed to update usage: ${error.message}`);
    }
  }
}

module.exports = SubscriptionService;