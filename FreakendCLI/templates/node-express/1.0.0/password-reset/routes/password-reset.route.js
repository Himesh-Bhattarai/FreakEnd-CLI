const express = require('express');
const authController = require('../../controllers/auth.controller');
const authValidation = require('../../validations/auth.validation');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
  authController.resetPassword
);

module.exports = router;