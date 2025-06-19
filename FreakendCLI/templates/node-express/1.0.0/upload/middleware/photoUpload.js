const multer = require('multer');
const path = require('path');
const config = require('../../config/uploads/photos');
const ApiError = require('../../utils/ApiError');
const fs = require('fs');
const sharp = require('sharp');

// Ensure directories exist
[config.storage.local.tempDir, config.storage.local.processedDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.local.tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid image type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
}).single('photo');

const processImage = async (file) => {
  const processedPath = path.join(
    config.storage.local.processedDir,
    path.basename(file.path)
  );
  
  // Create multiple versions
  await sharp(file.path)
    .resize(config.transformations.medium.width, config.transformations.medium.height)
    .toFile(processedPath.replace(/(\.\w+)$/, '_medium$1'));
    
  await sharp(file.path)
    .resize(config.transformations.thumbnail.width, config.transformations.thumbnail.height)
    .toFile(processedPath.replace(/(\.\w+)$/, '_thumb$1'));

  return {
    original: file.path,
    medium: processedPath.replace(/(\.\w+)$/, '_medium$1'),
    thumbnail: processedPath.replace(/(\.\w+)$/, '_thumb$1')
  };
};

module.exports = {
  upload,
  processImage
};