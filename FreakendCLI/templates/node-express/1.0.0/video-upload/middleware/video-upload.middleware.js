const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-ms-wmv',
    'video/x-flv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 1
  }
});

// Middleware to validate video file
const validateVideoFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No video file uploaded'
    });
  }

  const allowedExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid video format. Supported formats: MP4, AVI, MOV, WMV, FLV, WebM'
    });
  }

  // Check file size (500MB limit)
  if (req.file.size > 500 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size allowed is 500MB'
    });
  }

  next();
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size allowed is 500MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one video file is allowed'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Use "video" field name'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error'
        });
    }
  }

  if (error.message === 'Invalid file type. Only video files are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

module.exports = {
  upload,
  validateVideoFile,
  handleMulterError
};