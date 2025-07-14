const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
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
} = require('../controllers/subscription.controllers');

const authenticateToken = require('../middleware/auth.middleware'); // Assuming this exists
const { requireActiveSubscription } = require('../middleware/subscription.middleware');

// Plan management routes (Admin only - add admin middleware as needed)
router.post('/plans', [
  body('name').isLength({ min: 2, max: 50 }).trim().notEmpty(),
  body('displayName').isLength({ min: 2, max: 100 }).trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('currency').isLength({ min: 3, max: 3 }).toUpperCase(),
  body('interval').isIn(['month', 'year', 'one-time']),
  body('features').optional().isArray(),
  body('limitations.maxUsers').optional().isInt({ min: -1 }),
  body('limitations.maxStorage').optional().isInt({ min: -1 }),
  body('limitations.maxApiCalls').optional().isInt({ min: -1 }),
  body('trialDays').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isFree').optional().isBoolean()
], createPlan);

router.get('/plans', getPlans);
router.get('/plans/:planId', [
  param('planId').isMongoId()
], getPlan);

// User subscription routes
router.post('/subscribe/:planId', authenticateToken, [
  param('planId').isMongoId(),
  body('paymentMethodId').optional().isString(),
  body('useFreeTrial').optional().isBoolean()
], subscribe);

router.get('/my-subscription', authenticateToken, getMySubscription);

router.post('/cancel/:subscriptionId', authenticateToken, [
  param('subscriptionId').isMongoId(),
  body('reason').optional().isString().trim()
], cancelSubscription);

router.post('/upgrade/:subscriptionId', authenticateToken, [
  param('subscriptionId').isMongoId(),
  body('newPlanId').isMongoId()
], upgradeSubscription);

router.post('/renew/:subscriptionId', authenticateToken, [
  param('subscriptionId').isMongoId()
], renewSubscription);

router.post('/usage/:subscriptionId', authenticateToken, [
  param('subscriptionId').isMongoId(),
  body('usage').isObject(),
  body('usage.apiCalls').optional().isInt({ min: 0 }),
  body('usage.storage').optional().isInt({ min: 0 }),
  body('usage.users').optional().isInt({ min: 0 })
], updateUsage);

// Webhook endpoint (no authentication needed)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);