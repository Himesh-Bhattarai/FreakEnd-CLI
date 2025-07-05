const sharp = require('sharp');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Process image using Sharp
 */
const processImage = async (buffer) => {
  try {
    const targetSize = parseInt(process.env.AVATAR_DEFAULT_SIZE) || 300;
    const quality = parseInt(process.env.AVATAR_QUALITY) || 85;

    const processedImage = await sharp(buffer)
      .resize(targetSize, targetSize, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toBuffer();

    const metadata = await sharp(processedImage).metadata();

    return {
      buffer: processedImage,
      width: metadata.width,
      height: metadata.height,
      size: processedImage.length
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Generate unique filename
 */
const generateFilename = (originalname) => {
  const ext = path.extname(originalname);
  return `${uuidv4()}${ext}`;
};

/**
 * Upload file to S3
 */
const uploadToS3 = async (buffer, filename, mimeType) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `avatars/${filename}`,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result;
  } catch (error) {
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3
 */
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    // Don't throw error for cleanup operations
  }
};

/**
 * Delete local file
 */
const deleteLocalFile = async (filename) => {
  try {
    const uploadPath = path.join(process.cwd(), process.env.AVATAR_UPLOAD_PATH || 'uploads/avatars');
    const filePath = path.join(uploadPath, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Local file delete error:', error);
    // Don't throw error for cleanup operations
  }
};

/**
 * Validate image dimensions
 */
const validateImageDimensions = async (buffer, minWidth = 100, minHeight = 100) => {
  try {
    const metadata = await sharp(buffer).metadata();
    
    if (metadata.width < minWidth || metadata.height < minHeight) {
      throw new Error(`Image too small. Minimum dimensions: ${minWidth}x${minHeight}`);
    }
    
    return true;
  } catch (error) {
    throw new Error(`Image validation failed: ${error.message}`);
  }
};

/**
 * Get image metadata
 */
const getImageMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size
    };
  } catch (error) {
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
};

module.exports = {
  processImage,
  generateFilename,
  uploadToS3,
  deleteFromS3,
  deleteLocalFile,
  validateImageDimensions,
  getImageMetadata
};