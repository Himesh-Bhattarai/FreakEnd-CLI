const express = require('express');
const SMSController = require('../controllers/sms.controllers');
const {
  smsRateLimit,
  advancedRateLimit,
  validateSendOTP,
  validateVerifyOTP,
  captureClientInfo,
  authenticateToken
} = require('../middleware/sms.middleware');

const router = express.Router();

// Apply common middleware
router.use(captureClientInfo);

// Public routes
router.post('/send-otp', 
  smsRateLimit,
  advancedRateLimit,
  validateSendOTP,
  SMSController.sendOTP
);

router.post('/verify-otp',
  validateVerifyOTP,
  SMSController.verifyOTP
);

router.post('/resend-otp',
  smsRateLimit,
  advancedRateLimit,
  validateSendOTP,
  SMSController.resendOTP
);

// Protected routes (require authentication)
router.get('/status/:phoneNumber',
  authenticateToken,
  SMSController.getOTPStatus
);

// Health check endpoint
router.get('/health', (req, res) => {
  const SMSUtils = require('../utils/sms.utils');
  const isConfigured = SMSUtils.validateConfiguration();
  
  res.status(200).json({
    success: true,
    service: 'SMS Service',
    status: 'healthy',
    configured: isConfigured,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;