const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const config = require('../config/video');
const { Video } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Configure ffmpeg path
ffmpeg.setFfmpegPath(require('ffmpeg-static'));

const generateThumbnails = async (videoPath, outputDir, videoId) => {
  return new Promise((resolve, reject) => {
    const thumbnails = [];
    
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      
      const duration = metadata.format.duration;
      const interval = duration / (config.thumbnails.count + 1);
      
      for (let i = 1; i <= config.thumbnails.count; i++) {
        const timestamp = i * interval;
        const thumbName = `thumb_${i}_${videoId}.jpg`;
        const thumbPath = path.join(outputDir, thumbName);
        
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [timestamp],
            filename: thumbName,
            folder: outputDir,
            size: config.thumbnails.size
          })
          .on('end', () => {
            thumbnails.push(thumbName);
            if (thumbnails.length === config.thumbnails.count) {
              resolve(thumbnails);
            }
          })
          .on('error', reject);
      }
    });
  });
};

const processVideo = async (file, userId, videoData) => {
  const videoId = uuidv4();
  const processedDir = path.join(config.storage.local.processedDir, videoId);
  
  // Create directory for processed files
  fs.mkdirSync(processedDir, { recursive: true });
  
  // Get video metadata
  const metadata = await getVideoMetadata(file.path);
  
  // Generate thumbnails
  const thumbnails = await generateThumbnails(file.path, processedDir, videoId);
  
  // Move original file to processed directory
  const processedFilename = `video_${videoId}${path.extname(file.originalname)}`;
  const processedPath = path.join(processedDir, processedFilename);
  fs.renameSync(file.path, processedPath);
  
  // Create video record
  const video = await Video.create({
    _id: videoId,
    title: videoData.title,
    description: videoData.description,
    duration: metadata.duration,
    file: {
      path: processedPath,
      size: file.size,
      mimetype: file.mimetype,
      resolution: {
        width: metadata.width,
        height: metadata.height
      }
    },
    thumbnails,
    status: 'ready',
    owner: userId
  });
  
  return video;
};

const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      
      resolve({
        duration: metadata.format.duration,
        width: videoStream.width,
        height: videoStream.height
      });
    });
  });
};

const uploadToS3 = async (filePath, key) => {
  const AWS = require('aws-sdk');
  const fs = require('fs');
  
  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION
  });
  
  const fileStream = fs.createReadStream(filePath);
  
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileStream
  };
  
  return s3.upload(params).promise();
};

module.exports = {
  processVideo,
  uploadToS3,
  getVideoMetadata
};