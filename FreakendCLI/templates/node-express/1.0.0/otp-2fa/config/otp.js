module.exports = {
    // SMS OTP Configuration
    smsOtp: {
      length: 6,
      expiresInMinutes: 5,
      maxAttempts: 3,
      resendInterval: 60 // seconds
    },
    
    // Email OTP Configuration
    emailOtp: {
      length: 6,
      expiresInMinutes: 15,
      maxAttempts: 5
    },
    
    // TOTP Configuration (for 2FA)
    totp: {
      window: 1, // Accept 1 token before/after current
      step: 30, // 30-second steps
      digits: 6
    },
    
    // Rate limiting
    maxRequests: {
      sendOtp: 5, // per hour
      verifyOtp: 10 // per hour
    }
  };