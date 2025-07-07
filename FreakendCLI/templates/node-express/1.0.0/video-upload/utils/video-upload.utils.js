const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoUploadUtils {
  // Format file size to human readable format
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format duration to readable format
  static formatDuration(seconds) {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Validate video file extension
  static isValidVideoExtension(filename) {
    const allowedExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const extension = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Generate video quality options
  static getQualityOptions(originalWidth, originalHeight) {
    const options = [];
    
    // 480p
    if (originalHeight >= 480) {
      options.push({
        name: 'low',
        width: Math.floor(originalWidth * (480 / originalHeight)),
        height: 480,
        bitrate: '1000k'
      });
    }
    
    // 720p
    if (originalHeight >= 720) {
      options.push({
        name: 'medium',
        width: Math.floor(originalWidth * (720 / originalHeight)),
        height: 720,
        bitrate: '2500k'
      });
    }
    
    // 1080p
    if (originalHeight >= 1080) {
      options.push({
        name: 'high',
        width: Math.floor(originalWidth * (1080 / originalHeight)),
        height: 1080,
        bitrate: '5000k'
      });
    }
    
    // 4K
    if (originalHeight >= 2160) {
      options.push({
        name: 'ultra',
        width: Math.floor(originalWidth * (2160 / originalHeight)),
        height: 2160,
        bitrate: '20000k'
      });
    }
    
    return options;
  }

  // Generate secure filename
  static generateSecureFilename(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName).toLowerCase();
    return `video_${timestamp}_${randomString}${extension}`;
  }

  // Calculate video aspect ratio
  static calculateAspectRatio(width, height) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }

  // Get video category from filename or metadata
  static suggestCategory(filename, metadata = {}) {
    const name = filename.toLowerCase();
    
    if (name.includes('tutorial') || name.includes('learn') || name.includes('course')) {
      return 'education';
    }
    if (name.includes('music') || name.includes('song') || name.includes('concert')) {
      return 'music';
    }
    if (name.includes('sport') || name.includes('game') || name.includes('match')) {
      return 'sports';
    }
    if (name.includes('tech') || name.includes('code') || name.includes('programming')) {
      return 'technology';
    }
    if (name.includes('business') || name.includes('corporate') || name.includes('meeting')) {
      return 'business';
    }
    if (name.includes('health') || name.includes('fitness') || name.includes('workout')) {
      return 'health';
    }
    if (name.includes('funny') || name.includes('comedy') || name.includes('entertainment')) {
      return 'entertainment';
    }
    
    return 'other';
  }

  // Validate video metadata
  static validateVideoMetadata(metadata) {
    const errors = [];
    
    if (!metadata.duration || metadata.duration <= 0) {
      errors.push('Invalid video duration');
    }
    
    if (!metadata.width || !metadata.height) {
      errors.push('Invalid video dimensions');
    }
    
    if (metadata.duration > 3600) { // 1 hour limit
      errors.push('Video duration exceeds maximum limit of 1 hour');
    }
    
    if (metadata.width < 240 || metadata.height < 240) {
      errors.push('Video resolution is too low (minimum 240p)');
    }
    
    return errors;
  }

  // Generate video processing options based on quality
  static getProcessingOptions(quality) {
    const options = {
      low: {
        videoBitrate: '1000k',
        audioBitrate: '128k',
        scale: '640:480',
        fps: 24
      },
      medium: {
        videoBitrate: '2500k',
        audioBitrate: '192k',
        scale: '1280:720',
        fps: 30
      },
      high: {
        videoBitrate: '5000k',
        audioBitrate: '320k',
        scale: '1920:1080',
        fps: 30
      },
      ultra: {
        videoBitrate: '20000k',
        audioBitrate: '320k',
        scale: '3840:2160',
        fps: 60
      }
    };
    
    return options[quality] || options.medium;
  }
}

module.exports = VideoUploadUtils;