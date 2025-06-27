const requireEmailVerification = (emailVerificationService) => {
    return async (req, res, next) => {
      try {
        const email = req.user?.email || req.body?.email || req.query?.email;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: 'Email is required',
            code: 'EMAIL_REQUIRED'
          });
        }
  
        const status = await emailVerificationService.getVerificationStatus(email);
        
        if (!status.exists) {
          return res.status(403).json({
            success: false,
            error: 'Email verification required',
            code: 'VERIFICATION_REQUIRED',
            action: 'INITIATE_VERIFICATION'
          });
        }
  
        if (!status.verified) {
          return res.status(403).json({
            success: false,
            error: 'Email not verified',
            code: 'EMAIL_NOT_VERIFIED',
            action: status.expired ? 'RESEND_VERIFICATION' : 'COMPLETE_VERIFICATION',
            expiresAt: status.expiresAt,
            expired: status.expired
          });
        }
  
        // Email is verified, proceed
        req.emailVerified = true;
        req.verificationData = status;
        next();
        
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  };
  
  module.exports.requireEmailVerification = requireEmailVerification;