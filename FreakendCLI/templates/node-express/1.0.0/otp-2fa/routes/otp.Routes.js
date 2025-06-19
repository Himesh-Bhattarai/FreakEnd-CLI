const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { authValidation } = require('../validations');
const auth = require('../middlewares/auth');
const rateLimit = require('../middlewares/rateLimit');

const router = express.Router();

// OTP Routes
router.post(
  '/otp/send',
  rateLimit('sendOtp'),
  validate(authValidation.sendOtp),
  authController.sendOtp
);

router.post(
  '/otp/verify',
  rateLimit('verifyOtp'),
  validate(authValidation.verifyOtp),
  authController.verifyOtp
);

// 2FA Routes
router.post(
  '/2fa/setup',
  auth(),
  validate(authValidation.setup2fa),
  authController.setup2fa
);

router.post(
  '/2fa/enable',
  auth(),
  validate(authValidation.enable2fa),
  authController.enable2fa
);

router.post(
  '/2fa/verify',
  validate(authValidation.verify2fa),
  authController.verify2fa
);

module.exports = router;