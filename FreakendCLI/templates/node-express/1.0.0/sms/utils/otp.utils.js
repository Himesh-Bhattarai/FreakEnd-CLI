const crypto = require('crypto');

class OTPUtils {
  /**
   * Generate a secure random OTP
   * @param {number} length - Length of OTP (default: 6)
   * @returns {string} - Generated OTP
   */
  static generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  /**
   * Calculate OTP expiry time
   * @param {number} minutes - Minutes from now (default: 5)
   * @returns {Date} - Expiry date
   */
  static calculateExpiryTime(minutes = 5) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60 * 1000);
  }

  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} - Formatted phone number
   */
  static formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US +1 for demo)
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  static isValidPhoneNumber(phoneNumber) {
    // E.164 format validation
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Generate secure session token for OTP verification
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP code
   * @returns {string} - Session token
   */
  static generateSessionToken(phoneNumber, otp) {
    const data = `${phoneNumber}:${otp}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Mask phone number for security
   * @param {string} phoneNumber - Phone number to mask
   * @returns {string} - Masked phone number
   */
  static maskPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length <= 4) return phoneNumber;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    return phoneNumber.replace(cleaned, masked);
  }
}

module.exports = OTPUtils;