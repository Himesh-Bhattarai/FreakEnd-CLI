const twilio = require('twilio');

class SMSUtils {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Send SMS using Twilio
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} - SMS response
   */
  async sendSMS(to, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: result.to,
        from: result.from
      };
    } catch (error) {
      console.error('SMS Send Error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Send OTP SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} - SMS response
   */
  async sendOTP(phoneNumber, otp) {
    const message = `Your verification code is: ${otp}. This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code with anyone.`;
    
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send custom SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Custom message
   * @returns {Promise<Object>} - SMS response
   */
  async sendCustomMessage(phoneNumber, message) {
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Validate Twilio configuration
   * @returns {boolean} - Whether configuration is valid
   */
  static validateConfiguration() {
    const required = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER'
    ];

    return required.every(key => {
      const value = process.env[key];
      return value && value.trim() !== '';
    });
  }
}

module.exports = SMSUtils;