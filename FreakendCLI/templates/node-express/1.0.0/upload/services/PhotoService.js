const { Photo } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { uploadToCloud } = require('./storage/cloudStorage');
const config = require('../config/uploads/photos');

const createPhoto = async (fileData, user, body) => {
  try {
    // Process image versions
    const processedFiles = await processImage(fileData);
    
    // Upload to cloud storage if configured
    if (process.env.STORAGE_TYPE === 'cloud') {
      await Promise.all([
        uploadToCloud(processedFiles.original, 'photos/original'),
        uploadToCloud(processedFiles.medium, 'photos/medium'),
        uploadToCloud(processedFiles.thumbnail, 'photos/thumbnail')
      ]);
    }
    
    // Create photo record
    const photo = await Photo.create({
      title: body.title,
      description: body.description,
      files: {
        original: {
          path: processedFiles.original,
          size: fileData.size,
          mimetype: fileData.mimetype,
          width: body.metadata?.width,
          height: body.metadata?.height
        },
        medium: {
          path: processedFiles.medium,
          size: fs.statSync(processedFiles.medium).size
        },
        thumbnail: {
          path: processedFiles.thumbnail,
          size: fs.statSync(processedFiles.thumbnail).size
        }
      },
      owner: user.id,
      metadata: body.metadata
    });
    
    return photo;
  } catch (error) {
    logger.error(`Photo creation failed: ${error.message}`);
    throw new ApiError(500, 'Photo processing failed');
  }
};

module.exports = {
  createPhoto
};