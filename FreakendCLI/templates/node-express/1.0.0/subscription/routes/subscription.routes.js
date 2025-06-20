const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');

router.post('/', subscriptionController.createSubscription);
router.patch('/:id/cancel', subscriptionController.cancelSubscription);

module.exports = router;