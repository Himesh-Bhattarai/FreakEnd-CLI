const User = require('../models/userModel');
const ProfileSanitizer = require('../utils/profileSanitizer');
const mongoose = require('mongoose');

class ProfileController {
  // GET /profile/:id - Get user profile
  static async getProfile(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }

      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Increment profile views (only if viewing someone else's profile)
      if (req.user._id.toString() !== id) {
        await User.findByIdAndUpdate(id, { $inc: { profileViews: 1 } });
      }

      // Sanitize output
      const sanitizedProfile = ProfileSanitizer.sanitizeProfileOutput(user.toObject());
      
      // Remove sensitive fields for public viewing
      const isOwnProfile = req.user._id.toString() === id;
      if (!isOwnProfile && !req.user.isAdmin) {
        delete sanitizedProfile.email;
        delete sanitizedProfile.lastLoginAt;
      }

      return res.status(200).json({
        success: true,
        data: {
          profile: sanitizedProfile,
          isOwnProfile
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile'
      });
    }
  }

  // PUT /profile/:id - Update user profile
  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      
      // Sanitize input data
      const sanitizedData = ProfileSanitizer.sanitizeProfileInput(req.body);
      
      // Remove empty strings and undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === '' || sanitizedData[key] === undefined) {
          delete sanitizedData[key];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          ...sanitizedData,
          updatedAt: new Date()
        },
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Sanitize output
      const sanitizedProfile = ProfileSanitizer.sanitizeProfileOutput(updatedUser.toObject());

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: sanitizedProfile
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // DELETE /profile/:id - Deactivate user account
  static async deleteProfile(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Account is already deactivated'
        });
      }

      // Soft delete - deactivate account instead of hard delete
      await User.findByIdAndUpdate(id, { 
        isActive: false,
        updatedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
      });

    } catch (error) {
      console.error('Delete profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate account'
      });
    }
  }

  // POST /profile/:id/avatar - Upload profile avatar
  static async uploadAvatar(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // In production, you would upload to AWS S3, Cloudinary, etc.
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          avatar: avatarUrl,
          updatedAt: new Date()
        },
        { 
          new: true,
          select: '-password'
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar: avatarUrl
        }
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }
  }
}

module.exports = ProfileController;