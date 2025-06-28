

// ===============================================
// routes/profile.route.js
// ===============================================
const express = require('express');
const multer = require('multer');
const path = require('path');
const ProfileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const {
  profileUpdateValidation,
  handleValidationErrors,
  filterAllowedFields,
  checkProfileOwnership
} = require('../middleware/validateProfileUpdate');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(authenticateToken);

// GET /profile/:id - Get user profile
router.get('/:id', ProfileController.getProfile);

// PUT /profile/:id - Update user profile
router.put(
  '/:id',
  profileUpdateValidation,
  handleValidationErrors,
  filterAllowedFields,
  checkProfileOwnership,
  ProfileController.updateProfile
);

// DELETE /profile/:id - Deactivate user account
router.delete(
  '/:id',
  checkProfileOwnership,
  ProfileController.deleteProfile
);

// POST /profile/:id/avatar - Upload profile avatar
router.post(
  '/:id/avatar',
  checkProfileOwnership,
  upload.single('avatar'),
  ProfileController.uploadAvatar
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large (max 5MB)'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(error);
});

module.exports = router;