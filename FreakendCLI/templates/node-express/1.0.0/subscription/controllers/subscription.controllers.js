const Subscription = require('../models/subscription.models');
const SubscriptionPlan = require('../models/subscriptionPlan.models');
const SubscriptionService = require('../services/subscription.services');
const SubscriptionUtils = require('../utils/subscription.utils');
const { validationResult } = require('express-validator');

const subscriptionService = new SubscriptionService(process.env.PAYMENT_PROVIDER);

const createPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const plan = new SubscriptionPlan(req.body);
    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating subscription plan',
      error: error.message
    });
  }
};

const getPlans = async (req, res) => {
  try {
    const { active = true } = req.query;
    const filter = active === 'true' ? { isActive: true } : {};
    
    const plans = await SubscriptionPlan.find(filter).sort({ price: 1 });
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plans',
      error: error.message
    });
  }
};

const getPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await SubscriptionPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plan',
      error: error.message
    });
  }
};

const subscribe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { planId } = req.params;
    const { paymentMethodId, useFreeTrial = false } = req.body;
    const userId = req.user.id;

    const subscription = await subscriptionService.createSubscription(
      userId,
      planId,
      paymentMethodId,
      useFreeTrial
    );

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: SubscriptionUtils.formatSubscriptionResponse(subscription)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hasActiveSubscription, subscription } = await subscriptionService.checkSubscriptionStatus(userId);
    
    res.json({
      success: true,
      hasActiveSubscription,
      data: subscription ? SubscriptionUtils.formatSubscriptionResponse(subscription) : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;
    
    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user.id
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const canceledSubscription = await subscriptionService.cancelSubscription(subscriptionId, reason);
    
    res.json({
      success: true,
      message: 'Subscription canceled successfully',
      data: SubscriptionUtils.formatSubscriptionResponse(canceledSubscription)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const upgradeSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { newPlanId } = req.body;
    
    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user.id
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const upgradedSubscription = await subscriptionService.upgradeSubscription(subscriptionId, newPlanId);
    
    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: SubscriptionUtils.formatSubscriptionResponse(upgradedSubscription)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user.id
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const renewedSubscription = await subscriptionService.renewSubscription(subscriptionId);
    
    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: SubscriptionUtils.formatSubscriptionResponse(renewedSubscription)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateUsage = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { usage } = req.body;
    
    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user.id
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const updatedSubscription = await subscriptionService.updateUsage(subscriptionId, usage);
    
    res.json({
      success: true,
      message: 'Usage updated successfully',
      data: SubscriptionUtils.formatSubscriptionResponse(updatedSubscription)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] || req.headers['x-razorpay-signature'];
    
    if (process.env.PAYMENT_PROVIDER === 'stripe') {
      const event = req.body;
      
      switch (event.type) {
        case 'invoice.payment_succeeded':
          // Handle successful payment
          const invoice = event.data.object;
          await handlePaymentSuccess(invoice);
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          const failedInvoice = event.data.object;
          await handlePaymentFailure(failedInvoice);
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          const subscription = event.data.object;
          await handleSubscriptionCancellation(subscription);
          break;
      }
    }
    
    res.status(200).send('Webhook handled');
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Webhook handling failed',
      error: error.message
    });
  }
};

const handlePaymentSuccess = async (invoice) => {
  const subscription = await Subscription.findOne({
    'paymentDetails.subscriptionId': invoice.subscription
  });
  
  if (subscription) {
    subscription.status = 'active';
    subscription.paymentDetails.lastPaymentDate = new Date();
    await subscription.save();
  }
};

const handlePaymentFailure = async (invoice) => {
  const subscription = await Subscription.findOne({
    'paymentDetails.subscriptionId': invoice.subscription
  });
  
  if (subscription) {
    subscription.status = 'past_due';
    await subscription.save();
  }
};

const handleSubscriptionCancellation = async (stripeSubscription) => {
  const subscription = await Subscription.findOne({
    'paymentDetails.subscriptionId': stripeSubscription.id
  });
  
  if (subscription) {
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  subscribe,
  getMySubscription,
  cancelSubscription,
  upgradeSubscription,
  renewSubscription,
  updateUsage,
  handleWebhook
};