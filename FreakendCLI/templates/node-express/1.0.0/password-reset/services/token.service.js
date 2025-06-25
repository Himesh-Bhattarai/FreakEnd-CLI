const crypto = require('crypto');
const moment = require('moment');
const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const logger = require('../utils/logger');

const generatePasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists in system
    logger.info(`Password reset requested for non-existent email: ${email}`);
    return;
  }

  // Generate token and set expiry (10 minutes)
  const resetToken = user.createPasswordResetToken();
  await user.save();

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
    logger.info(`Password reset email sent to ${user.email}`);
  } catch (error) {
    // Clear the token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    logger.error(`Error sending password reset email to ${user.email}:`, error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error sending password reset email'
    );
  }
};

const verifyPasswordResetToken = async (token) => {
  // Hash the token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token is invalid or has expired');
  }

  return user;
};

const resetPassword = async (token, newPassword) => {
  const user = await verifyPasswordResetToken(token);
  
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  try {
    await emailService.sendPasswordChangedEmail(user.email);
    logger.info(`Password successfully reset for ${user.email}`);
  } catch (error) {
    logger.error(`Error sending password changed email to ${user.email}:`, error);
    // Don't fail the operation if email fails
  }
};

module.exports = {
  generatePasswordResetToken,
  verifyPasswordResetToken,
  resetPassword
};