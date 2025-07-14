const Subscription = require('../models/subscription.models');
const SubscriptionPlan = require('../models/subscriptionPlan.models');
const SubscriptionUtils = require('../utils/subscription.utils');

const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] }
    }).populate('planId');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required'
      });
    }

    // Check if subscription is expired
    if (subscription.endDate <= new Date()) {
      subscription.status = 'expired';
      await subscription.save();
      
      return res.status(403).json({
        success: false,
        message: 'Subscription expired'
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status',
      error: error.message
    });
  }
};

const requirePlan = (requiredPlanName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trial'] }
      }).populate('planId');

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required'
        });
      }

      if (subscription.planId.name !== requiredPlanName) {
        return res.status(403).json({
          success: false,
          message: `${requiredPlanName} plan required`
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking plan requirements',
        error: error.message
      });
    }
  };
};

const checkUsageLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription;
      const plan = subscription.planId;
      
      const errors = SubscriptionUtils.validateUsageLimits(subscription, plan);
      
      if (errors.length > 0) {
        return res.status(429).json({
          success: false,
          message: 'Usage limit exceeded',
          errors
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking usage limits',
        error: error.message
      });
    }
  };
};

const incrementUsage = (usageType, amount = 1) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription;
      
      subscription.usage[usageType] = (subscription.usage[usageType] || 0) + amount;
      await subscription.save();
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating usage',
        error: error.message
      });
    }
  };
};

module.exports = {
  requireActiveSubscription,
  requirePlan,
  checkUsageLimits,
  incrementUsage
};