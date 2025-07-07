const express = require('express');
const router = express.Router();
const videoUploadController = require('../controllers/video-upload.controller');
const videoUploadMiddleware = require('../middleware/video-upload.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');

// Validation rules
const uploadValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['education', 'entertainment', 'business', 'technology', 'health', 'sports', 'music', 'other'])
    .withMessage('Invalid category'),
  body('privacy')
    .optional()
    .isIn(['public', 'private', 'unlisted'])
    .withMessage('Invalid privacy setting'),
  body('quality')
    .optional()
    .isIn(['low', 'medium', 'high', 'ultra'])
    .withMessage('Invalid quality setting')
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid video ID'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['education', 'entertainment', 'business', 'technology', 'health', 'sports', 'music', 'other'])
    .withMessage('Invalid category'),
  body('privacy')
    .optional()
    .isIn(['public', 'private', 'unlisted'])
    .withMessage('Invalid privacy setting')
];

// Public routes
router.get('/public', videoUploadController.getPublicVideos);
router.post('/view/:id', param('id').isMongoId(), videoUploadController.incrementViews);

// Protected routes
router.use(authenticateToken);

// Upload video
router.post('/upload', 
  videoUploadMiddleware.upload.single('video'),
  videoUploadMiddleware.validateVideoFile,
  uploadValidation,
  videoUploadController.uploadVideo
);

// Get user's videos
router.get('/my-videos', videoUploadController.getUserVideos);

// Get video by ID
router.get('/:id', 
  param('id').isMongoId().withMessage('Invalid video ID'),
  videoUploadController.getVideoById
);

// Update video
router.put('/:id', updateValidation, videoUploadController.updateVideo);

// Delete video
router.delete('/:id', 
  param('id').isMongoId().withMessage('Invalid video ID'),
  videoUploadController.deleteVideo
);

// Get processing status
router.get('/:id/status', 
  param('id').isMongoId().withMessage('Invalid video ID'),
  videoUploadController.getProcessingStatus
);

module.exports = router;