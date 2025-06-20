const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/process', paymentController.processPayment);
router.post('/confirm', paymentController.confirmPayment);

module.exports = router;
