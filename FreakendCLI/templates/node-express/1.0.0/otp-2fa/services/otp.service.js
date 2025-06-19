const crypto = require('crypto');
const OTP = require('../models/OTP.model');
const config = require('../config/otp');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const httpStatus = require('http-status');

class OTPService {
  constructor(type) {
    this.type = type;
    this.config = config[`${type}Otp`] || config.smsOtp;
  }

  async generate(identifier, metadata = {}) {
    // Delete any existing OTPs for this identifier
    await OTP.deleteMany({ identifier, type: this.type });

    const code = this._generateCode();
    const expiresAt = new Date(Date.now() + this.config.expiresInMinutes * 60000);

    const otp = await OTP.create({
      code,
      identifier,
      type: this.type,
      expiresAt,
      metadata
    });

    return { code: this.type === 'totp' ? null : code, expiresAt };
  }

  async verify(identifier, code) {
    const otp = await OTP.findOne({
      identifier,
      type: this.type,
      expiresAt: { $gt: new Date() },
      verified: false
    }).sort({ createdAt: -1 });

    if (!otp) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired or not found');
    }

    if (otp.attempts >= this.config.maxAttempts) {
      throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Maximum attempts reached');
    }

    // For TOTP, we need special handling
    if (this.type === 'totp') {
      const isValid = await this._verifyTotp(code, identifier);
      if (!isValid) {
        await OTP.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid code');
      }
    } else {
      if (otp.code !== code) {
        await OTP.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid code');
      }
    }

    // Mark as verified
    await OTP.updateOne({ _id: otp._id }, { verified: true });

    return true;
  }

  _generateCode() {
    if (this.type === 'totp') return null;
    
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < this.config.length; i++) {
      code += digits[crypto.randomInt(0, digits.length)];
    }
    return code;
  }

  async _verifyTotp(token, secret) {
    const totpService = require('./totp.service');
    return totpService.verifyToken(secret, token);
  }
}

module.exports = {
  smsOtpService: new OTPService('sms'),
  emailOtpService: new OTPService('email'),
  totpService: new OTPService('totp')
};