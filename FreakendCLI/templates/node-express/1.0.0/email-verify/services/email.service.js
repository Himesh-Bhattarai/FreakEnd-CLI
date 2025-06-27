const nodemailer = require('nodemailer');

class EmailService {
  constructor(config) {
    this.transporter = nodemailer.createTransporter(config);
  }

  async send(emailData) {
    try {
      const info = await this.transporter.sendMail({
        from: emailData.from || process.env.EMAIL_FROM,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

module.exports.EmailService = EmailService;