const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const VideoUpload = require('../models/video-upload.model');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

class VideoUploadService {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;
  }

  // Process and upload video to S3
  async processAndUploadVideo(file, videoRecord) {
    try {
      // Update processing status
      videoRecord.processingStatus = 'processing';
      await videoRecord.save();

      // Get video metadata
      const metadata = await this.getVideoMetadata(file.path);
      
      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(file.path, videoRecord.filename);

      // Upload original video to S3
      const videoS3Key = `videos/${videoRecord.filename}${path.extname(file.originalname)}`;
      const videoS3Url = await this.uploadToS3(file.path, videoS3Key, file.mimetype);

      // Upload thumbnail to S3
      const thumbnailS3Key = `thumbnails/${videoRecord.filename}.jpg`;
      const thumbnailS3Url = await this.uploadToS3(thumbnailPath, thumbnailS3Key, 'image/jpeg');

      // Update video record with S3 URLs and metadata
      videoRecord.s3Key = videoS3Key;
      videoRecord.s3Url = videoS3Url;
      videoRecord.thumbnailS3Key = thumbnailS3Key;
      videoRecord.thumbnailUrl = thumbnailS3Url;
      videoRecord.duration = metadata.duration;
      videoRecord.resolution = {
        width: metadata.width,
        height: metadata.height
      };
      videoRecord.metadata = {
        codec: metadata.codec,
        bitrate: metadata.bitrate,
        fps: metadata.fps,
        aspectRatio: metadata.aspectRatio
      };
      videoRecord.processingStatus = 'completed';
      await videoRecord.save();

      // Clean up local files
      await this.cleanupLocalFiles([file.path, thumbnailPath]);

      return {
        success: true,
        videoUrl: videoS3Url,
        thumbnailUrl: thumbnailS3Url
      };

    } catch (error) {
      console.error('Video processing error:', error);
      
      // Update processing status to failed
      videoRecord.processingStatus = 'failed';
      videoRecord.processingError = error.message;
      await videoRecord.save();

      // Clean up local files
      try {
        await this.cleanupLocalFiles([file.path]);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      throw error;
    }
  }

  // Get video metadata using ffmpeg
  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: metadata.format.duration,
          width: videoStream.width,
          height: videoStream.height,
          codec: videoStream.codec_name,
          bitrate: parseInt(metadata.format.bit_rate),
          fps: eval(videoStream.r_frame_rate),
          aspectRatio: `${videoStream.width}:${videoStream.height}`
        });
      });
    });
  }

  // Generate thumbnail from video
  async generateThumbnail(videoPath, filename) {
    const thumbnailPath = path.join(process.cwd(), 'uploads/thumbnails', `${filename}.jpg`);
    
    // Create thumbnails directory if it doesn't exist
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['10%'],
          filename: `${filename}.jpg`,
          folder: path.dirname(thumbnailPath),
          size: '320x240'
        })
        .on('end', () => {
          resolve(thumbnailPath);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  // Upload file to S3
  async uploadToS3(filePath, s3Key, contentType) {
    try {
      const fileContent = await fs.readFile(filePath);
      
      const params = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'public-read'
      };

      const result = await s3.upload(params).promise();
      
      // Return CloudFront URL if available, otherwise S3 URL
      if (this.cloudfrontUrl) {
        return `${this.cloudfrontUrl}/${s3Key}`;
      }
      
      return result.Location;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  // Delete video from S3
  async deleteVideoFromS3(videoS3Key, thumbnailS3Key) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: [
            { Key: videoS3Key },
            ...(thumbnailS3Key ? [{ Key: thumbnailS3Key }] : [])
          ]
        }
      };

      await s3.deleteObjects(deleteParams).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete video from S3: ${error.message}`);
    }
  }

  // Clean up local files
  async cleanupLocalFiles(filePaths) {
    try {
      await Promise.all(
        filePaths.map(async (filePath) => {
          try {
            await fs.unlink(filePath);
          } catch (error) {
            console.error(`Failed to delete file ${filePath}:`, error);
          }
        })
      );
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Get video stream URL (for streaming)
  getVideoStreamUrl(s3Key) {
    if (this.cloudfrontUrl) {
      return `${this.cloudfrontUrl}/${s3Key}`;
    }
    return s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: s3Key,
      Expires: 3600 // 1 hour
    });
  }
}

module.exports = new VideoUploadService();