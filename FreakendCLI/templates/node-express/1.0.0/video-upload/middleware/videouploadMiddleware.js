const multer = require('multer');
const path = require('path');
const config = require('../config/video');
const ApiError = require('../utils/ApiError');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(config.storage.local.tempDir);
ensureDir(config.storage.local.processedDir);

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
    cb(new ApiError(400, 'Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});

// Stream-based upload handler for very large files
const streamUpload = (req, res, next) => {
  const Busboy = require('busboy');
  const path = require('path');
  const fs = require('fs');
  const config = require('../config/video');
  
  const busboy = new Busboy({ 
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: config.maxFileSize
    }
  });
  
  const fileData = {
    originalname: '',
    mimetype: '',
    filename: '',
    path: '',
    size: 0
  };
  
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (!config.allowedTypes.includes(mimetype)) {
      return next(new ApiError(400, 'Invalid file type'));
    }
    
    const ext = path.extname(filename);
    const tempFilename = `${Date.now()}${ext}`;
    const saveTo = path.join(config.storage.local.tempDir, tempFilename);
    
    fileData.originalname = filename;
    fileData.mimetype = mimetype;
    fileData.filename = tempFilename;
    fileData.path = saveTo;
    
    file.on('limit', () => {
      next(new ApiError(413, 'File too large'));
    });
    
    file.on('data', (data) => {
      fileData.size += data.length;
    });
    
    file.pipe(fs.createWriteStream(saveTo));
  });
  
  busboy.on('finish', () => {
    req.file = fileData;
    next();
  });
  
  req.pipe(busboy);
};

module.exports = {
  singleUpload: upload.single('video'),
  streamUpload
};