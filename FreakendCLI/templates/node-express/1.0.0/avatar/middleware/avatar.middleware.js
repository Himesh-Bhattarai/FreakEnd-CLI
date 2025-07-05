const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFormats = (process.env.AVATAR_ALLOWED_FORMATS || 'jpg,jpeg,png,webp').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedFormats.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.AVATAR_MAX_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1
  }
});

// Middleware to validate avatar upload
const validateAvatarUpload = upload.single('avatar');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size allowed is ' + 
                Math.round((parseInt(process.env.AVATAR_MAX_SIZE) || 5242880) / 1024 / 1024) + 'MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

// Middleware to validate file presence
const validateFilePresence = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  next();
};

module.exports = {
  validateAvatarUpload,
  handleMulterError,
  validateFilePresence
};