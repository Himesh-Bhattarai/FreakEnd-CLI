const express = require('express');
const EmailVerifyController = require('../controllers/email-verify.controllers');
const { validateEmailVerification, validateResendRequest } = require('../middleware/email-verify.middleware');
const router = express.Router();

// Public routes
router.post('/send', validateEmailVerification, EmailVerifyController.sendVerificationEmail);
router.get('/verify/:token', EmailVerifyController.verifyEmail);
router.get('/status', EmailVerifyController.checkVerificationStatus);
router.post('/resend', validateResendRequest, EmailVerifyController.resendVerificationEmail);

module.exports = router;