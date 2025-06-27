const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting middleware
const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, error: 'Too many verification attempts, please try again later' }
});

const resendRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 resend requests per windowMs
  message: { success: false, error: 'Too many resend requests, please try again later' }
});

// Validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Valid email address is required'
    });
  }
  next();
};

const validateVerificationParams = (req, res, next) => {
  const { email, token } = req.query.email ? req.query : req.body;
  
  if (!email || !token) {
    return res.status(400).json({
      success: false,
      error: 'Email and token are required'
    });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Valid email address is required'
    });
  }
  
  next();
};

// Routes factory function
const createEmailVerifyRoutes = (emailVerificationService) => {
  
  // Initiate email verification
  router.post('/send', resendRateLimit, validateEmail, async (req, res) => {
    try {
      const { email, metadata, baseUrl, subject, template } = req.body;
      
      const result = await emailVerificationService.initiateVerification(email, {
        metadata,
        baseUrl,
        subject,
        template
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Verify email with token
  router.get('/verify', verifyRateLimit, validateVerificationParams, async (req, res) => {
    try {
      const { email, token } = req.query;
      
      const result = await emailVerificationService.verifyEmail(email, token);

      if (result.success) {
        // Redirect to success page or return JSON
        if (req.query.redirect === 'false') {
          res.status(200).json(result);
        } else {
          res.redirect(`/email-verified?success=true&email=${encodeURIComponent(email)}`);
        }
      } else {
        if (req.query.redirect === 'false') {
          res.status(400).json(result);
        } else {
          res.redirect(`/email-verify-error?error=${encodeURIComponent(result.error)}`);
        }
      }
    } catch (error) {
      const errorResponse = {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
      
      if (req.query.redirect === 'false') {
        res.status(500).json(errorResponse);
      } else {
        res.redirect('/email-verify-error?error=Internal server error');
      }
    }
  });

  // Verify email with token (POST method)
  router.post('/verify', verifyRateLimit, validateVerificationParams, async (req, res) => {
    try {
      const { email, token } = req.body;
      
      const result = await emailVerificationService.verifyEmail(email, token);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get verification status
  router.get('/status/:email', async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Valid email address is required'
        });
      }

      const status = await emailVerificationService.getVerificationStatus(email);
      res.status(200).json({
        success: true,
        ...status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Resend verification email
  router.post('/resend', resendRateLimit, validateEmail, async (req, res) => {
    try {
      const { email, baseUrl, subject, template } = req.body;
      
      const result = await emailVerificationService.resendVerification(email, {
        baseUrl,
        subject,
        template
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  return router;
};

module.exports = createEmailVerifyRoutes;