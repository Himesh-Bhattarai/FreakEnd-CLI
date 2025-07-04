const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validatePaymentIntent, validateSubscription, validateRefund } = require('../middleware/payment.middleware');

// Payment Intent Routes
router.post('/intent', authenticateToken, validatePaymentIntent, paymentController.createPaymentIntent);
router.get('/history', authenticateToken, paymentController.getPaymentHistory);
router.get('/:paymentId', authenticateToken, paymentController.getPayment);
router.post('/:paymentId/refund', authenticateToken, validateRefund, paymentController.refundPayment);

// Subscription Routes
router.post('/subscription', authenticateToken, validateSubscription, paymentController.createSubscription);
router.get('/subscriptions', authenticateToken, paymentController.getSubscriptions);
router.put('/subscription/:subscriptionId/cancel', authenticateToken, paymentController.cancelSubscription);

// Webhook Route (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;