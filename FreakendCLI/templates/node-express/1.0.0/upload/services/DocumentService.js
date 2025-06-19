const { Document } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { uploadToCloud } = require('./storage/cloudStorage');
const config = require('../config/uploads/documents');

const createDocument = async (fileData, user, body) => {
  try {
    // Extract document metadata
    const metadata = await extractDocumentInfo(fileData);
    
    // Upload to cloud storage if configured
    if (process.env.STORAGE_TYPE === 'cloud') {
      await uploadToCloud(fileData.path, 'documents');
    }
    
    // Create document record
    const document = await Document.create({
      title: body.title || fileData.originalname,
      description: body.description,
      file: {
        path: fileData.path,
        size: fileData.size,
        mimetype: fileData.mimetype,
        originalName: fileData.originalname
      },
      owner: user.id,
      metadata: {
        ...metadata,
        ...body.metadata
      }
    });
    
    return document;
  } catch (error) {
    logger.error(`Document creation failed: ${error.message}`);
    throw new ApiError(500, 'Document processing failed');
  }
};

module.exports = {
  createDocument
};