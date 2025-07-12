const { OTP } = require('../models/sms.models');
const SMSUtils = require('../utils/sms.utils');
const OTPUtils = require('../utils/otp.utils');

class SMSController {
  /**
   * Send OTP to phone number
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async sendOTP(req, res) {
    try {
      const { phoneNumber, purpose = 'verification' } = req.body;
      const { ipAddress, userAgent } = req.clientInfo;

      // Check if there's an existing unverified OTP
      const existingOTP = await OTP.findOne({
        phoneNumber,
        isVerified: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (existingOTP) {
        const timeLeft = Math.ceil((existingOTP.expiresAt - new Date()) / 1000 / 60);
        return res.status(400).json({
          success: false,
          message: `OTP already sent. Please wait ${timeLeft} minutes before requesting a new one.`,
          timeLeft: timeLeft
        });
      }

      // Generate OTP
      const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
      const otp = OTPUtils.generateOTP(otpLength);
      const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
      const expiresAt = OTPUtils.calculateExpiryTime(expiryMinutes);

      // Create OTP record
      const otpRecord = new OTP({
        phoneNumber,
        otpHash: otp, // Will be hashed by pre-save middleware
        expiresAt,
        ipAddress,
        userAgent
      });

      await otpRecord.save();

      // Send SMS
      const smsUtils = new SMSUtils();
      const smsResult = await smsUtils.sendOTP(phoneNumber, otp);

      if (!smsResult.success) {
        // Delete OTP record if SMS failed
        await OTP.findByIdAndDelete(otpRecord._id);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send SMS. Please try again.',
          error: process.env.NODE_ENV === 'development' ? smsResult.error : undefined
        });
      }

      // Log successful OTP send
      console.log(`OTP sent to ${OTPUtils.maskPhoneNumber(phoneNumber)} - ID: ${otpRecord._id}`);

      res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${OTPUtils.maskPhoneNumber(phoneNumber)}`,
        otpId: otpRecord._id,
        expiresAt: expiresAt.toISOString(),
        expiresIn: expiryMinutes * 60, // seconds
        messageId: smsResult.messageId
      });

    } catch (error) {
      console.error('Send OTP Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verify OTP
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async verifyOTP(req, res) {
    try {
      const { phoneNumber, otp } = req.body;
      const { ipAddress, userAgent } = req.clientInfo;

      // Find the latest unverified OTP for this phone number
      const otpRecord = await OTP.findOne({
        phoneNumber,
        isVerified: false
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'No valid OTP found for this phone number'
        });
      }

      // Check if OTP is expired
      if (otpRecord.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
      }

      // Check if max attempts reached
      if (otpRecord.isMaxAttemptsReached()) {
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts reached. Please request a new OTP.'
        });
      }

      // Increment attempt count
      otpRecord.attempts += 1;
      await otpRecord.save();

      // Verify OTP
      const isValid = await otpRecord.verifyOTP(otp);

      if (!isValid) {
        const remainingAttempts = 3 - otpRecord.attempts;
        
        if (remainingAttempts <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
          });
        }

        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          remainingAttempts
        });
      }

      // Mark OTP as verified
      otpRecord.isVerified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();

      // Log successful verification
      console.log(`OTP verified for ${OTPUtils.maskPhoneNumber(phoneNumber)} - ID: ${otpRecord._id}`);

      // Generate JWT token (optional)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          phoneNumber,
          verified: true,
          verifiedAt: otpRecord.verifiedAt,
          otpId: otpRecord._id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        verified: true,
        verifiedAt: otpRecord.verifiedAt.toISOString(),
        token,
        phoneNumber: OTPUtils.maskPhoneNumber(phoneNumber)
      });

    } catch (error) {
      console.error('Verify OTP Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get OTP status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async getOTPStatus(req, res) {
    try {
      const { phoneNumber } = req.params;
      const formattedNumber = OTPUtils.formatPhoneNumber(phoneNumber);

      const otpRecord = await OTP.findOne({
        phoneNumber: formattedNumber,
        isVerified: false
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(404).json({
          success: false,
          message: 'No active OTP found for this phone number'
        });
      }

      const now = new Date();
      const timeLeft = Math.max(0, Math.ceil((otpRecord.expiresAt - now) / 1000));
      const isExpired = otpRecord.isExpired();

      res.status(200).json({
        success: true,
        status: {
          phoneNumber: OTPUtils.maskPhoneNumber(formattedNumber),
          isExpired,
          timeLeft,
          attempts: otpRecord.attempts,
          maxAttempts: 3,
          remainingAttempts: Math.max(0, 3 - otpRecord.attempts),
          createdAt: otpRecord.createdAt.toISOString(),
          expiresAt: otpRecord.expiresAt.toISOString()
        }
      });

    } catch (error) {
      console.error('Get OTP Status Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Resend OTP
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async resendOTP(req, res) {
    try {
      const { phoneNumber } = req.body;

      // Cancel any existing unverified OTP
      await OTP.updateMany(
        { phoneNumber, isVerified: false },
        { expiresAt: new Date() } // Expire immediately
      );

      // Use the same logic as sendOTP
      req.body = { phoneNumber, purpose: 'resend' };
      await SMSController.sendOTP(req, res);

    } catch (error) {
      console.error('Resend OTP Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SMSController;