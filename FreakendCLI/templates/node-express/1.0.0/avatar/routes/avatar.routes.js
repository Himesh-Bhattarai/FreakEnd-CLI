const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatar.controller');
const authenticateToken = require('../middleware/auth.middleware'); // Assuming this exists
const { validateAvatarUpload, handleMulterError } = require('../middleware/avatar.middleware');

// Protected routes (require authentication)
router.post('/upload', 
  authenticateToken, 
  validateAvatarUpload, 
  handleMulterError,
  avatarController.uploadAvatar
);

router.get('/me', 
  authenticateToken, 
  avatarController.getAvatar
);

router.delete('/me', 
  authenticateToken, 
  avatarController.deleteAvatar
);

router.patch('/visibility', 
  authenticateToken, 
  avatarController.updateAvatarVisibility
);

// Public routes
router.get('/user/:userId', 
  avatarController.getAvatarByUserId
);

module.exports = router;