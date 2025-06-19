const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const config = require('../config/otp');
const ApiError = require('../utils/ApiError');

class TOTPService {
  generateSecret() {
    return speakeasy.generateSecret({
      length: 32,
      name: process.env.APP_NAME,
      issuer: process.env.APP_NAME
    });
  }

  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: config.totp.window,
      step: config.totp.step
    });
  }

  async generateQRCode(secret, email) {
    try {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: encodeURIComponent(email),
        issuer: process.env.APP_NAME,
        encoding: 'base32'
      });

      return QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate QR code');
    }
  }

  generateBackupCodes(count = 5) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }
}

module.exports = new TOTPService();