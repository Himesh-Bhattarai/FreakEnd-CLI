const crypto = require('crypto');

class EmailVerificationService {
  constructor(config = {}) {
    this.config = {
      tokenExpiry: config.tokenExpiry || 24 * 60 * 60 * 1000, // 24 hours
      maxVerificationAttempts: config.maxVerificationAttempts || 5,
      resendCooldown: config.resendCooldown || 5 * 60 * 1000, // 5 minutes
      storage: config.storage,
      emailService: config.emailService,
      tokenGenerator: config.tokenGenerator,
      onVerificationSuccess: config.onVerificationSuccess || (() => {}),
      onVerificationFailure: config.onVerificationFailure || (() => {}),
      onTokenExpired: config.onTokenExpired || (() => {}),
    };

    this._validateConfig();
  }

  _validateConfig() {
    const required = ['storage', 'emailService', 'tokenGenerator'];
    for (const prop of required) {
      if (!this.config[prop]) {
        throw new Error(`EmailVerificationService: ${prop} is required`);
      }
    }
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async _checkResendCooldown(email) {
    const lastSent = await this.config.storage.getLastSentTime(email);
    if (lastSent && (Date.now() - lastSent) < this.config.resendCooldown) {
      const remainingTime = Math.ceil((this.config.resendCooldown - (Date.now() - lastSent)) / 1000);
      throw new Error(`Please wait ${remainingTime} seconds before requesting another verification email`);
    }
  }

  async _sendVerificationEmail(email, token, options = {}) {
    const verificationUrl = options.baseUrl 
      ? `${options.baseUrl}/verify-email?email=${encodeURIComponent(email)}&token=${token}`
      : `http://localhost:3000/api/email-verify/verify?email=${encodeURIComponent(email)}&token=${token}`;

    const emailData = {
      to: email,
      subject: options.subject || 'Verify Your Email Address',
      html: options.template ? 
        options.template.replace('{verificationUrl}', verificationUrl).replace('{email}', email) :
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        `
    };

    return await this.config.emailService.send(emailData);
  }

  async initiateVerification(email, options = {}) {
    try {
      if (!this._isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      await this._checkResendCooldown(normalizedEmail);
      
      const token = await this.config.tokenGenerator.generate({
        email: normalizedEmail,
        type: 'email_verification',
        expiresIn: this.config.tokenExpiry
      });

      const verificationData = {
        email: normalizedEmail,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.tokenExpiry),
        attempts: 0,
        verified: false,
        lastAttemptAt: null,
        metadata: options.metadata || {}
      };

      await this.config.storage.saveVerification(normalizedEmail, verificationData);
      await this.config.storage.setLastSentTime(normalizedEmail, Date.now());

      const emailResult = await this._sendVerificationEmail(normalizedEmail, token, options);

      return {
        success: true,
        email: normalizedEmail,
        message: 'Verification email sent successfully',
        expiresAt: verificationData.expiresAt,
        emailId: emailResult.messageId
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code || 'VERIFICATION_INIT_FAILED'
      };
    }
  }

  async verifyEmail(email, token) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const verificationData = await this.config.storage.getVerification(normalizedEmail);
      
      if (!verificationData) {
        throw new Error('No verification found for this email');
      }

      if (verificationData.verified) {
        return {
          success: true,
          email: normalizedEmail,
          message: 'Email already verified',
          verifiedAt: verificationData.verifiedAt
        };
      }

      if (new Date() > new Date(verificationData.expiresAt)) {
        await this.config.onTokenExpired(normalizedEmail, verificationData);
        throw new Error('Verification token has expired');
      }

      if (verificationData.attempts >= this.config.maxVerificationAttempts) {
        throw new Error('Maximum verification attempts exceeded');
      }

      verificationData.attempts++;
      verificationData.lastAttemptAt = new Date();

      const tokenValid = await this.config.tokenGenerator.verify(token, {
        email: normalizedEmail,
        type: 'email_verification'
      });

      if (!tokenValid) {
        await this.config.storage.saveVerification(normalizedEmail, verificationData);
        await this.config.onVerificationFailure(normalizedEmail, verificationData);
        throw new Error('Invalid verification token');
      }

      verificationData.verified = true;
      verificationData.verifiedAt = new Date();
      
      await this.config.storage.saveVerification(normalizedEmail, verificationData);
      await this.config.onVerificationSuccess(normalizedEmail, verificationData);

      return {
        success: true,
        email: normalizedEmail,
        message: 'Email verified successfully',
        verifiedAt: verificationData.verifiedAt
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code || 'VERIFICATION_FAILED'
      };
    }
  }

  async getVerificationStatus(email) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const verificationData = await this.config.storage.getVerification(normalizedEmail);
      
      if (!verificationData) {
        return {
          exists: false,
          verified: false,
          email: normalizedEmail
        };
      }

      const isExpired = new Date() > new Date(verificationData.expiresAt);
      
      return {
        exists: true,
        verified: verificationData.verified,
        email: normalizedEmail,
        createdAt: verificationData.createdAt,
        expiresAt: verificationData.expiresAt,
        expired: isExpired,
        attempts: verificationData.attempts,
        maxAttempts: this.config.maxVerificationAttempts,
        verifiedAt: verificationData.verifiedAt,
        metadata: verificationData.metadata
      };

    } catch (error) {
      throw new Error(`Failed to get verification status: ${error.message}`);
    }
  }

  async resendVerification(email, options = {}) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const verificationData = await this.config.storage.getVerification(normalizedEmail);
      
      if (!verificationData) {
        throw new Error('No verification found for this email');
      }

      if (verificationData.verified) {
        throw new Error('Email is already verified');
      }

      await this._checkResendCooldown(normalizedEmail);

      const newToken = await this.config.tokenGenerator.generate({
        email: normalizedEmail,
        type: 'email_verification',
        expiresIn: this.config.tokenExpiry
      });

      verificationData.token = newToken;
      verificationData.expiresAt = new Date(Date.now() + this.config.tokenExpiry);
      verificationData.attempts = 0;
      
      await this.config.storage.saveVerification(normalizedEmail, verificationData);
      await this.config.storage.setLastSentTime(normalizedEmail, Date.now());

      const emailResult = await this._sendVerificationEmail(normalizedEmail, newToken, options);

      return {
        success: true,
        email: normalizedEmail,
        message: 'Verification email resent successfully',
        expiresAt: verificationData.expiresAt,
        emailId: emailResult.messageId
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code || 'RESEND_FAILED'
      };
    }
  }
}

module.exports = EmailVerificationService;