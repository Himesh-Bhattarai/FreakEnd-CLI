// templates/node-express/1.0.0/graphql/services/userService.js
const { UserInputError, ForbiddenError } = require('apollo-server-express');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

class UserService {
  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Object} User object
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} input - Update data
   * @returns {Object} Updated user
   */
  async updateProfile(userId, input) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      // Check if username/email is being changed and if it's available
      if (input.username && input.username !== user.username) {
        const existingUser = await User.findOne({ 
          username: input.username,
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          throw new UserInputError('Username already taken');
        }
      }

      if (input.email && input.email !== user.email) {
        const existingUser = await User.findOne({ 
          email: input.email,
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          throw new UserInputError('Email already registered');
        }
        
        // If email is changed, mark as unverified
        user.isEmailVerified = false;
      }

      // Update allowed fields
      const allowedFields = [
        'username', 'email', 'firstName', 'lastName', 
        'bio', 'avatar'
      ];

      allowedFields.forEach(field => {
        if (input[field] !== undefined) {
          user[field] = input[field];
        }
      });

      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new UserInputError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
      }
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param {String} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Object} Updated user
   */
  async updatePreferences(userId, preferences) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      // Merge preferences
      if (preferences.theme) {
        user.preferences.theme = preferences.theme;
      }

      if (preferences.notifications) {
        if (preferences.notifications.email !== undefined) {
          user.preferences.notifications.email = preferences.notifications.email;
        }
        if (preferences.notifications.push !== undefined) {
          user.preferences.notifications.push = preferences.notifications.push;
        }
      }

      if (preferences.privacy) {
        if (preferences.privacy.showEmail !== undefined) {
          user.preferences.privacy.showEmail = preferences.privacy.showEmail;
        }
        if (preferences.privacy.showProfile !== undefined) {
          user.preferences.privacy.showProfile = preferences.privacy.showProfile;
        }
      }

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update social links
   * @param {String} userId - User ID
   * @param {Object} socialLinks - Social media links
   * @returns {Object} Updated user
   */
  async updateSocialLinks(userId, socialLinks) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      // Validate and update social links
      const allowedPlatforms = ['website', 'twitter', 'github', 'linkedin'];
      
      allowedPlatforms.forEach(platform => {
        if (socialLinks[platform] !== undefined) {
          if (socialLinks[platform] && !this.isValidUrl(socialLinks[platform])) {
            throw new UserInputError(`Invalid ${platform} URL`);
          }
          user.socialLinks[platform] = socialLinks[platform];
        }
      });

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users with pagination and search
   * @param {Object} options - Query options
   * @returns {Object} Users with pagination info
   */
  async getUsers({ pagination = {}, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * Math.min(limit, 50);
      const actualLimit = Math.min(limit, 50);

      // Build search query
      let query = { isActive: true };
      
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [users, total] = await Promise.all([
        User.find(query)
          .sort(sort)
          .skip(skip)
          .limit(actualLimit),
        User.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / actualLimit);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @returns {Object} User statistics
   */
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      const [postsCount, publishedPostsCount, commentsCount, totalViews, totalLikes] = await Promise.all([
        Post.countDocuments({ author: userId, isDeleted: false }),
        Post.countDocuments({ author: userId, status: 'PUBLISHED', isDeleted: false }),
        Comment.countDocuments({ author: userId, isDeleted: false }),
        Post.aggregate([
          { $match: { author: user._id, isDeleted: false } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]),
        Post.aggregate([
          { $match: { author: user._id, isDeleted: false } },
          { $project: { likesCount: { $size: '$likes' } } },
          { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
        ])
      ]);

      return {
        postsCount,
        publishedPostsCount,
        commentsCount,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        joinedAt: user.createdAt,
        lastActivity: user.lastActivity
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Follow a user
   * @param {String} followerId - Follower user ID
   * @param {String} followingId - User to follow ID
   * @returns {Boolean} Success status
   */
  async followUser(followerId, followingId) {
    try {
      if (followerId === followingId) {
        throw new UserInputError('Cannot follow yourself');
      }

      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new UserInputError('User not found');
      }

      // Check if already following
      if (follower.following && follower.following.includes(followingId)) {
        throw new UserInputError('Already following this user');
      }

      // Add to following/followers lists
      if (!follower.following) follower.following = [];
      if (!following.followers) following.followers = [];

      follower.following.push(followingId);
      following.followers.push(followerId);

      await Promise.all([
        follower.save(),
        following.save()
      ]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unfollow a user
   * @param {String} followerId - Follower user ID
   * @param {String} followingId - User to unfollow ID
   * @returns {Boolean} Success status
   */
  async unfollowUser(followerId, followingId) {
    try {
      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new UserInputError('User not found');
      }

      // Remove from following/followers lists
      if (follower.following) {
        follower.following = follower.following.filter(id => id.toString() !== followingId);
      }
      
      if (following.followers) {
        following.followers = following.followers.filter(id => id.toString() !== followerId);
      }

      await Promise.all([
        follower.save(),
        following.save()
      ]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account (soft delete)
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  async deleteAccount(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      // Soft delete user
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      user.username = `deleted_${Date.now()}_${user.username}`;
      await user.save();

      // Soft delete user's posts and comments
      await Promise.all([
        Post.updateMany(
          { author: userId },
          { 
            isDeleted: true, 
            deletedAt: new Date(),
            title: '[Deleted Post]',
            content: '[This post has been deleted]'
          }
        ),
        Comment.updateMany(
          { author: userId },
          { 
            isDeleted: true, 
            deletedAt: new Date(),
            content: '[Comment deleted]'
          }
        )
      ]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate user account
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  async deactivateAccount(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      user.isActive = false;
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reactivate user account
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  async reactivateAccount(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      user.isActive = true;
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users
   * @param {String} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Users matching search
   */
  async searchUsers(query, options = {}) {
    try {
      const { limit = 20, skip = 0 } = options;
      
      return await User.search(query, { limit, skip });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user activity feed
   * @param {String} userId - User ID
   * @param {Object} pagination - Pagination options
   * @returns {Array} Activity items
   */
  async getUserActivity(userId, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      // Get recent posts and comments
      const [recentPosts, recentComments] = await Promise.all([
        Post.find({ 
          author: userId, 
          isDeleted: false 
        })
          .populate('author')
          .sort({ createdAt: -1 })
          .limit(10),
        
        Comment.find({ 
          author: userId, 
          isDeleted: false 
        })
          .populate(['author', 'post'])
          .sort({ createdAt: -1 })
          .limit(10)
      ]);

      // Combine and sort by date
      const activities = [
        ...recentPosts.map(post => ({
          type: 'post',
          action: post.status === 'PUBLISHED' ? 'published' : 'created',
          item: post,
          createdAt: post.createdAt
        })),
        ...recentComments.map(comment => ({
          type: 'comment',
          action: 'commented',
          item: comment,
          createdAt: comment.createdAt
        }))
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit);

      return activities;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate URL format
   * @param {String} url - URL to validate
   * @returns {Boolean} Is valid URL
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user recommendations
   * @param {String} userId - User ID
   * @param {Number} limit - Number of recommendations
   * @returns {Array} Recommended users
   */
  async getUserRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      // Simple recommendation: users with similar interests (tags)
      // In production, you might use more sophisticated algorithms
      
      const userPosts = await Post.find({ 
        author: userId, 
        isDeleted: false 
      }).select('tags');
      
      const userTags = [...new Set(userPosts.flatMap(post => post.tags))];

      if (userTags.length === 0) {
        // If user has no posts with tags, return recently active users
        return await User.find({ 
          _id: { $ne: userId },
          isActive: true 
        })
          .sort({ lastActivity: -1 })
          .limit(limit);
      }

      // Find users who write about similar topics
      const similarUsers = await Post.aggregate([
        {
          $match: {
            tags: { $in: userTags },
            author: { $ne: user._id },
            status: 'PUBLISHED',
            isDeleted: false
          }
        },
        {
          $group: {
            _id: '$author',
            commonTags: { $addToSet: '$tags' },
            postCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $match: {
            'user.isActive': true
          }
        },
        {
          $sort: { postCount: -1 }
        },
        {
          $limit: limit
        },
        {
          $replaceRoot: { newRoot: '$user' }
        }
      ]);

      return similarUsers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();