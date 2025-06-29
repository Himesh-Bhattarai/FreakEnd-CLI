const Reaction = require('../models/reaction.model');
const buildReactionStats = require('../utils/buildReactionStats');
const mongoose = require('mongoose');

const reactionController = {
  // Add or update reaction
  addOrUpdateReaction: async (req, res) => {
    try {
      const { contentId, reactionType } = req.body;
      const userId = req.user.id; // From JWT middleware

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content ID format'
        });
      }

      // Check if user already has a reaction for this content
      const existingReaction = await Reaction.findOne({ userId, contentId });

      let reaction;
      let action;

      if (existingReaction) {
        // Update existing reaction
        if (existingReaction.reactionType === reactionType) {
          return res.status(200).json({
            success: true,
            message: 'Reaction already exists',
            data: existingReaction,
            action: 'no_change'
          });
        }

        existingReaction.reactionType = reactionType;
        reaction = await existingReaction.save();
        action = 'updated';
      } else {
        // Create new reaction
        reaction = new Reaction({
          userId,
          contentId,
          reactionType
        });
        await reaction.save();
        action = 'created';
      }

      // Get updated stats
      const stats = await buildReactionStats(contentId);

      res.status(action === 'created' ? 201 : 200).json({
        success: true,
        message: `Reaction ${action} successfully`,
        data: reaction,
        stats,
        action
      });

    } catch (error) {
      console.error('Error in addOrUpdateReaction:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get reaction stats for content
  getReactionStats: async (req, res) => {
    try {
      const { contentId } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content ID format'
        });
      }

      const stats = await buildReactionStats(contentId);
      const userReaction = req.user ? 
        await Reaction.getUserReaction(req.user.id, contentId) : null;

      res.status(200).json({
        success: true,
        data: {
          contentId,
          stats,
          userReaction: userReaction ? userReaction.reactionType : null,
          totalReactions: Object.values(stats).reduce((sum, count) => sum + count, 0)
        }
      });

    } catch (error) {
      console.error('Error in getReactionStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Remove user's reaction
  removeReaction: async (req, res) => {
    try {
      const { contentId } = req.body;
      const userId = req.user.id;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content ID format'
        });
      }

      const reaction = await Reaction.findOneAndDelete({ userId, contentId });

      if (!reaction) {
        return res.status(404).json({
          success: false,
          message: 'Reaction not found'
        });
      }

      // Get updated stats
      const stats = await buildReactionStats(contentId);

      res.status(200).json({
        success: true,
        message: 'Reaction removed successfully',
        data: reaction,
        stats
      });

    } catch (error) {
      console.error('Error in removeReaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user's reactions (bonus endpoint)
  getUserReactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const reactions = await Reaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('contentId', 'title type'); // Adjust fields based on your content model

      const total = await Reaction.countDocuments({ userId });

      res.status(200).json({
        success: true,
        data: reactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error in getUserReactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = reactionController;