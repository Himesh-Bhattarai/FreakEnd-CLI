const multer = require('multer');
const path = require('path');
const config = require('../../config/uploads/documents');
const ApiError = require('../../utils/ApiError');
const fs = require('fs');
const pdf = require('pdf-parse');

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
    cb(new ApiError(400, 'Invalid document type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
}).single('document');

const extractDocumentInfo = async (file) => {
  if (file.mimetype === 'application/pdf') {
    const dataBuffer = fs.readFileSync(file.path);
    const data = await pdf(dataBuffer);
    return {
      pageCount: data.numpages,
      text: data.text.substring(0, 500) // First 500 chars
    };
  }
  return {};
};

module.exports = {
  upload,
  extractDocumentInfo
};