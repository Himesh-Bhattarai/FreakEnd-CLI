const EmailVerification = require('../models/email-verify.models');
const { sendVerificationEmail, generateVerificationToken } = require('../utils/email-verify.utils');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

class EmailVerifyController {
  // Send verification email
  static async sendVerificationEmail(req, res) {
    try {
      const { email, userId } = req.body;

      // Validate input
      if (!email || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Email and userId are required'
        });
      }

      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId format'
        });
      }

      // Check for existing verification
      let verification = await EmailVerification.findOne({ 
        userId: userId,
        email: email.toLowerCase()
      });

      if (verification) {
        // If already verified
        if (verification.isVerified) {
          return res.status(400).json({
            success: false,
            message: 'Email is already verified'
          });
        }

        // Check if max attempts reached
        if (verification.hasMaxAttemptsReached()) {
          return res.status(429).json({
            success: false,
            message: 'Maximum verification attempts reached. Please contact support.'
          });
        }

        // Check rate limiting (1 email per 2 minutes)
        const timeSinceLastAttempt = Date.now() - verification.lastVerificationAttempt.getTime();
        if (timeSinceLastAttempt < 2 * 60 * 1000) {
          return res.status(429).json({
            success: false,
            message: 'Please wait 2 minutes before requesting another verification email'
          });
        }

        // Update existing verification
        verification.verificationToken = generateVerificationToken();
        verification.verificationAttempts += 1;
        verification.lastVerificationAttempt = new Date();
        verification.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await verification.save();
      } else {
        // Create new verification
        verification = new EmailVerification({
          userId,
          email: email.toLowerCase(),
          verificationToken: generateVerificationToken(),
          verificationAttempts: 1
        });
        await verification.save();
      }

      // Send verification email
      await sendVerificationEmail(email, verification.verificationToken);

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        data: {
          email: email.toLowerCase(),
          expiresAt: verification.expiresAt
        }
      });

    } catch (error) {
      console.error('Send verification email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify email token
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }

      // Find verification record
      const verification = await EmailVerification.findOne({
        verificationToken: token
      });

      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      // Check if already verified
      if (verification.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Check if expired
      if (verification.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'Verification token has expired'
        });
      }

      // Update verification status
      verification.isVerified = true;
      await verification.save();

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          email: verification.email,
          userId: verification.userId,
          verifiedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Check verification status
  static async checkVerificationStatus(req, res) {
    try {
      const { userId, email } = req.query;

      if (!userId || !email) {
        return res.status(400).json({
          success: false,
          message: 'userId and email are required'
        });
      }

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId format'
        });
      }

      const verification = await EmailVerification.findOne({
        userId: userId,
        email: email.toLowerCase()
      });

      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'No verification record found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          isVerified: verification.isVerified,
          email: verification.email,
          verificationAttempts: verification.verificationAttempts,
          maxAttemptsReached: verification.hasMaxAttemptsReached(),
          expiresAt: verification.expiresAt,
          isExpired: verification.isExpired()
        }
      });

    } catch (error) {
      console.error('Check verification status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check verification status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Resend verification email
  static async resendVerificationEmail(req, res) {
    try {
      const { userId, email } = req.body;

      if (!userId || !email) {
        return res.status(400).json({
          success: false,
          message: 'userId and email are required'
        });
      }

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId format'
        });
      }

      const verification = await EmailVerification.findOne({
        userId: userId,
        email: email.toLowerCase()
      });

      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'No verification record found'
        });
      }

      if (verification.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      if (verification.hasMaxAttemptsReached()) {
        return res.status(429).json({
          success: false,
          message: 'Maximum verification attempts reached. Please contact support.'
        });
      }

      // Check rate limiting
      const timeSinceLastAttempt = Date.now() - verification.lastVerificationAttempt.getTime();
      if (timeSinceLastAttempt < 2 * 60 * 1000) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 2 minutes before requesting another verification email'
        });
      }

      // Update verification token and attempts
      verification.verificationToken = generateVerificationToken();
      verification.verificationAttempts += 1;
      verification.lastVerificationAttempt = new Date();
      verification.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await verification.save();

      // Send verification email
      await sendVerificationEmail(email, verification.verificationToken);

      res.status(200).json({
        success: true,
        message: 'Verification email resent successfully',
        data: {
          email: verification.email,
          attemptsRemaining: 5 - verification.verificationAttempts,
          expiresAt: verification.expiresAt
        }
      });

    } catch (error) {
      console.error('Resend verification email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = EmailVerifyController;