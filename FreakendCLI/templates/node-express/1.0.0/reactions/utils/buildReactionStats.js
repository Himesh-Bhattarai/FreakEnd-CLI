const Reaction = require('../models/reaction.model');
const mongoose = require('mongoose');

/**
 * Build comprehensive reaction statistics for a given content ID
 * @param {string|ObjectId} contentId - The content ID to get stats for
 * @returns {Promise<Object>} - Statistics object with reaction counts
 */
const buildReactionStats = async (contentId) => {
  try {
    // Ensure contentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      throw new Error('Invalid content ID format');
    }

    // Get reaction stats using aggregation pipeline
    const stats = await Reaction.aggregate([
      {
        $match: { 
          contentId: mongoose.Types.ObjectId(contentId) 
        }
      },
      {
        $group: {
          _id: '$reactionType',
          count: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          reactionType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$users' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Build the stats object
    const reactionStats = {};
    let totalReactions = 0;
    let totalUniqueUsers = 0;

    // Initialize all possible reaction types with 0
    const allReactionTypes = ['like', 'dislike', '❤️', '🔥', '😢', '😂', '👍', '👎', '😍', '😮'];
    allReactionTypes.forEach(type => {
      reactionStats[type] = 0;
    });

    // Populate with actual data
    stats.forEach(stat => {
      reactionStats[stat.reactionType] = stat.count;
      totalReactions += stat.count;
    });

    // Calculate unique users (users who have reacted)
    const uniqueUsersResult = await Reaction.aggregate([
      {
        $match: { 
          contentId: mongoose.Types.ObjectId(contentId) 
        }
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          count: { $size: '$uniqueUsers' }
        }
      }
    ]);

    totalUniqueUsers = uniqueUsersResult.length > 0 ? uniqueUsersResult[0].count : 0;

    // Calculate engagement metrics
    const engagementMetrics = {
      totalReactions,
      totalUniqueUsers,
      averageReactionsPerUser: totalUniqueUsers > 0 ? (totalReactions / totalUniqueUsers).toFixed(2) : 0,
      mostPopularReaction: getMostPopularReaction(reactionStats),
      reactionDistribution: getReactionDistribution(reactionStats, totalReactions)
    };

    return {
      ...reactionStats,
      meta: engagementMetrics
    };

  } catch (error) {
    console.error('Error building reaction stats:', error);
    throw new Error('Failed to build reaction stats');
  }
};

/**
 * Get the most popular reaction type
 * @param {Object} stats - Reaction stats object
 * @returns {string|null} - Most popular reaction type
 */
const getMostPopularReaction = (stats) => {
  let maxCount = 0;
  let mostPopular = null;

  Object.entries(stats).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopular = type;
    }
  });

  return mostPopular;
};

/**
 * Get reaction distribution percentages
 * @param {Object} stats - Reaction stats object
 * @param {number} total - Total reactions
 * @returns {Object} - Distribution percentages
 */
const getReactionDistribution = (stats, total) => {
  if (total === 0) return {};

  const distribution = {};
  Object.entries(stats).forEach(([type, count]) => {
    if (count > 0) {
      distribution[type] = ((count / total) * 100).toFixed(1) + '%';
    }
  });

  return distribution;
};

module.exports = buildReactionStats;