const moment = require('moment');

class SubscriptionUtils {
  static calculateEndDate(startDate, interval) {
    return moment(startDate).add(1, interval).toDate();
  }

  static isSubscriptionActive(subscription) {
    return subscription.status === 'active' && subscription.endDate > new Date();
  }

  static isInTrialPeriod(subscription) {
    return subscription.status === 'trial' && 
           subscription.trialEndDate && 
           subscription.trialEndDate > new Date();
  }

  static getDaysUntilExpiry(subscription) {
    return Math.max(0, moment(subscription.endDate).diff(moment(), 'days'));
  }

  static formatSubscriptionResponse(subscription) {
    return {
      id: subscription._id,
      status: subscription.status,
      plan: subscription.planId,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isExpired: subscription.endDate <= new Date(),
      isInTrial: subscription.isInTrial,
      daysUntilExpiry: this.getDaysUntilExpiry(subscription),
      usage: subscription.usage,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    };
  }

  static validateUsageLimits(subscription, plan) {
    const errors = [];
    
    if (plan.limitations.maxApiCalls !== -1 && 
        subscription.usage.apiCalls >= plan.limitations.maxApiCalls) {
      errors.push('API call limit exceeded');
    }

    if (plan.limitations.maxStorage !== -1 && 
        subscription.usage.storage >= plan.limitations.maxStorage) {
      errors.push('Storage limit exceeded');
    }

    if (plan.limitations.maxUsers !== -1 && 
        subscription.usage.users >= plan.limitations.maxUsers) {
      errors.push('User limit exceeded');
    }

    return errors;
  }

  static calculateProrationAmount(oldPlan, newPlan, daysRemaining) {
    const oldDailyRate = oldPlan.price / 30; // Assuming monthly
    const newDailyRate = newPlan.price / 30;
    
    const refund = oldDailyRate * daysRemaining;
    const newCharge = newDailyRate * daysRemaining;
    
    return newCharge - refund;
  }
}

module.exports = SubscriptionUtils;