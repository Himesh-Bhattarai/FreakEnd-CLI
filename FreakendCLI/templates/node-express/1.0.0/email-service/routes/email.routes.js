const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { validateEmail, validateTemplateExists } = require('../middleware/emailValidation');
const authenticateToken = require('../middleware/auth'); // Assuming JWT middleware exists

// Public routes (no authentication required)
router.post('/verify', emailController.verifyEmail);

// Protected routes (authentication required)
router.use(authenticateToken);

// Basic email sending
router.post('/send', 
  validateEmail('sendCustomEmail'),
  emailController.sendCustomEmail
);

router.post('/send-bulk', 
  validateEmail('sendBulkEmail'),
  emailController.sendBulkEmail
);

// Verification and password reset emails
router.post('/send-verification',
  validateEmail('sendVerificationEmail'),
  emailController.sendVerificationEmail
);

router.post('/send-password-reset',
  validateEmail('sendPasswordResetEmail'),
  emailController.sendPasswordResetEmail
);

router.post('/send-welcome',
  validateEmail('sendVerificationEmail'), // Reuse same validation
  emailController.sendWelcomeEmail
);

// Template management
router.post('/templates',
  validateEmail('createTemplate'),
  emailController.createTemplate
);

router.get('/templates',
  emailController.getTemplates
);

router.get('/templates/:id',
  emailController.getTemplate
);

router.put('/templates/:id',
  validateEmail('createTemplate'),
  emailController.updateTemplate
);

router.delete('/templates/:id',
  emailController.deleteTemplate
);

// Send email using template
router.post('/send-template',
  validateEmail('sendTemplateEmail'),
  validateTemplateExists,
  emailController.sendTemplateEmail
);

module.exports = router;