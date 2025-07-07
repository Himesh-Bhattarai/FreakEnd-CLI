const VideoUpload = require('../models/video-upload.model');
const videoUploadService = require('../services/video-upload.service');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class VideoUploadController {
  // Upload video
  async uploadVideo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No video file uploaded'
        });
      }

      const { title, description, tags, category, privacy, quality } = req.body;
      const userId = req.user.id;

      // Create video record
      const videoData = {
        userId,
        originalFilename: req.file.originalname,
        title,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category: category || 'other',
        privacy: privacy || 'public',
        quality: quality || 'medium',
        fileSize: req.file.size,
        format: path.extname(req.file.originalname).toLowerCase().substring(1)
      };

      const video = new VideoUpload(videoData);
      await video.save();

      // Upload to S3 and process video
      const result = await videoUploadService.processAndUploadVideo(req.file, video);

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          videoId: video._id,
          title: video.title,
          processingStatus: video.processingStatus,
          uploadProgress: 100
        }
      });

    } catch (error) {
      console.error('Upload video error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload video',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user's videos
  async getUserVideos(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, category, privacy, sort = '-createdAt' } = req.query;

      const filter = { userId, isActive: true };
      if (category) filter.category = category;
      if (privacy) filter.privacy = privacy;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: {
          path: 'userId',
          select: 'username email'
        }
      };

      const videos = await VideoUpload.paginate(filter, options);

      res.json({
        success: true,
        data: videos
      });

    } catch (error) {
      console.error('Get user videos error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve videos'
      });
    }
  }

  // Get video by ID
  async getVideoById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const video = await VideoUpload.findOne({
        _id: id,
        userId,
        isActive: true
      }).populate('userId', 'username email');

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: video
      });

    } catch (error) {
      console.error('Get video by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve video'
      });
    }
  }

  // Update video metadata
  async updateVideo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const { title, description, tags, category, privacy } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
      if (category) updateData.category = category;
      if (privacy) updateData.privacy = privacy;

      const video = await VideoUpload.findOneAndUpdate(
        { _id: id, userId, isActive: true },
        updateData,
        { new: true, runValidators: true }
      );

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        message: 'Video updated successfully',
        data: video
      });

    } catch (error) {
      console.error('Update video error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update video'
      });
    }
  }

  // Delete video
  async deleteVideo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const video = await VideoUpload.findOne({
        _id: id,
        userId,
        isActive: true
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Delete from S3
      await videoUploadService.deleteVideoFromS3(video.s3Key, video.thumbnailS3Key);

      // Soft delete
      video.isActive = false;
      await video.save();

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });

    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video'
      });
    }
  }

  // Get public videos
  async getPublicVideos(req, res) {
    try {
      const { page = 1, limit = 10, category, sort = '-createdAt' } = req.query;

      const filter = { 
        privacy: 'public', 
        isActive: true, 
        processingStatus: 'completed' 
      };
      if (category) filter.category = category;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: {
          path: 'userId',
          select: 'username'
        }
      };

      const videos = await VideoUpload.paginate(filter, options);

      res.json({
        success: true,
        data: videos
      });

    } catch (error) {
      console.error('Get public videos error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve public videos'
      });
    }
  }

  // Get video processing status
  async getProcessingStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const video = await VideoUpload.findOne({
        _id: id,
        userId,
        isActive: true
      }).select('processingStatus processingError');

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: {
          processingStatus: video.processingStatus,
          processingError: video.processingError
        }
      });

    } catch (error) {
      console.error('Get processing status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get processing status'
      });
    }
  }

  // Increment video views
  async incrementViews(req, res) {
    try {
      const { id } = req.params;

      const video = await VideoUpload.findOneAndUpdate(
        { _id: id, isActive: true, processingStatus: 'completed' },
        { $inc: { views: 1 } },
        { new: true }
      ).select('views');

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: { views: video.views }
      });

    } catch (error) {
      console.error('Increment views error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to increment views'
      });
    }
  }
}

module.exports = new VideoUploadController();