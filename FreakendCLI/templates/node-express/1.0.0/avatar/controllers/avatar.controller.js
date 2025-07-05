const Avatar = require('../models/avatar.model');
const { 
  processImage, 
  uploadToS3, 
  deleteFromS3, 
  deleteLocalFile,
  generateFilename 
} = require('../utils/avatar.utils');
const path = require('path');
const fs = require('fs').promises;

class AvatarController {
  /**
   * Upload and set user avatar
   */
  async uploadAvatar(req, res) {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Process the image
      const processedImage = await processImage(file.buffer);
      const filename = generateFilename(file.originalname);
      
      let avatarData = {
        userId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: processedImage.size,
        dimensions: {
          width: processedImage.width,
          height: processedImage.height
        },
        storageType: process.env.AWS_S3_BUCKET ? 's3' : 'local'
      };

      // Upload to storage
      if (process.env.AWS_S3_BUCKET) {
        const s3Result = await uploadToS3(processedImage.buffer, filename, file.mimetype);
        avatarData.url = s3Result.Location;
        avatarData.s3Key = s3Result.Key;
      } else {
        // Save locally
        const uploadPath = path.join(process.cwd(), process.env.AVATAR_UPLOAD_PATH || 'uploads/avatars');
        await fs.mkdir(uploadPath, { recursive: true });
        await fs.writeFile(path.join(uploadPath, filename), processedImage.buffer);
        avatarData.url = `/uploads/avatars/${filename}`;
      }

      // Check if user already has an avatar
      const existingAvatar = await Avatar.findOne({ userId });
      
      if (existingAvatar) {
        // Delete old avatar from storage
        if (existingAvatar.storageType === 's3' && existingAvatar.s3Key) {
          await deleteFromS3(existingAvatar.s3Key);
        } else if (existingAvatar.storageType === 'local') {
          await deleteLocalFile(existingAvatar.filename);
        }
        
        // Update existing avatar
        Object.assign(existingAvatar, avatarData);
        await existingAvatar.save();
      } else {
        // Create new avatar
        await Avatar.create(avatarData);
      }

      // Fetch updated avatar
      const avatar = await Avatar.findOne({ userId });

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar: {
            id: avatar._id,
            url: avatar.publicUrl,
            filename: avatar.filename,
            dimensions: avatar.dimensions,
            uploadedAt: avatar.uploadedAt
          }
        }
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user avatar
   */
  async getAvatar(req, res) {
    try {
      const userId = req.user.id;
      
      const avatar = await Avatar.findOne({ userId, isActive: true });
      
      if (!avatar) {
        return res.status(404).json({
          success: false,
          message: 'Avatar not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          avatar: {
            id: avatar._id,
            url: avatar.publicUrl,
            filename: avatar.filename,
            dimensions: avatar.dimensions,
            uploadedAt: avatar.uploadedAt
          }
        }
      });

    } catch (error) {
      console.error('Get avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get avatar',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get avatar by user ID (public endpoint)
   */
  async getAvatarByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      const avatar = await Avatar.findOne({ userId, isActive: true });
      
      if (!avatar) {
        return res.status(404).json({
          success: false,
          message: 'Avatar not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          avatar: {
            id: avatar._id,
            url: avatar.publicUrl,
            dimensions: avatar.dimensions,
            uploadedAt: avatar.uploadedAt
          }
        }
      });

    } catch (error) {
      console.error('Get avatar by user ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get avatar',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(req, res) {
    try {
      const userId = req.user.id;
      
      const avatar = await Avatar.findOne({ userId });
      
      if (!avatar) {
        return res.status(404).json({
          success: false,
          message: 'Avatar not found'
        });
      }

      // Delete from storage
      if (avatar.storageType === 's3' && avatar.s3Key) {
        await deleteFromS3(avatar.s3Key);
      } else if (avatar.storageType === 'local') {
        await deleteLocalFile(avatar.filename);
      }

      // Delete from database
      await Avatar.deleteOne({ userId });

      res.status(200).json({
        success: true,
        message: 'Avatar deleted successfully'
      });

    } catch (error) {
      console.error('Delete avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete avatar',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update avatar visibility
   */
  async updateAvatarVisibility(req, res) {
    try {
      const userId = req.user.id;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const avatar = await Avatar.findOne({ userId });
      
      if (!avatar) {
        return res.status(404).json({
          success: false,
          message: 'Avatar not found'
        });
      }

      avatar.isActive = isActive;
      await avatar.save();

      res.status(200).json({
        success: true,
        message: 'Avatar visibility updated successfully',
        data: {
          avatar: {
            id: avatar._id,
            url: avatar.publicUrl,
            isActive: avatar.isActive,
            uploadedAt: avatar.uploadedAt
          }
        }
      });

    } catch (error) {
      console.error('Update avatar visibility error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update avatar visibility',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AvatarController();