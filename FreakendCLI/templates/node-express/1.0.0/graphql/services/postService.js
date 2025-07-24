// templates/node-express/1.0.0/graphql/services/postService.js
const { UserInputError, ForbiddenError } = require('apollo-server-express');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Comment = require('../../models/Comment');

class PostService {
  /**
   * Create a new post
   * @param {String} authorId - Author's user ID
   * @param {Object} input - Post creation data
   * @returns {Object} Created post
   */
  async createPost(authorId, input) {
    try {
      const { title, content, excerpt, status, featuredImage, tags } = input;

      // Validate author exists
      const author = await User.findById(authorId);
      if (!author) {
        throw new UserInputError('Author not found');
      }

      // Clean and validate tags
      const cleanTags = tags
        ? tags
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
            .slice(0, 10) // Max 10 tags
        : [];

      const post = new Post({
        title: title.trim(),
        content,
        excerpt: excerpt?.trim(),
        status: status || 'DRAFT',
        featuredImage,
        tags: cleanTags,
        author: authorId
      });

      await post.save();
      await post.populate('author');

      return post;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.slug) {
        throw new UserInputError('A post with similar title already exists');
      }
      throw error;
    }
  }

  /**
   * Update an existing post
   * @param {String} postId - Post ID
   * @param {Object} input - Post update data
   * @returns {Object} Updated post
   */
  async updatePost(postId, input) {
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      // Update fields if provided
      Object.keys(input).forEach(key => {
        if (input[key] !== undefined) {
          if (key === 'tags') {
            // Clean and validate tags
            post.tags = input.tags
              .map(tag => tag.trim().toLowerCase())
              .filter(tag => tag.length > 0)
              .slice(0, 10);
          } else if (key === 'title') {
            post.title = input.title.trim();
          } else if (key === 'excerpt') {
            post.excerpt = input.excerpt?.trim();
          } else {
            post[key] = input[key];
          }
        }
      });

      await post.save();
      await post.populate('author');

      return post;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.slug) {
        throw new UserInputError('A post with similar title already exists');
      }
      throw error;
    }
  }

  /**
   * Delete a post (soft delete)
   * @param {String} postId - Post ID
   * @returns {Boolean} Success status
   */
  async deletePost(postId) {
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      await post.softDelete();

      // Optionally, soft delete associated comments
      await Comment.updateMany(
        { post: postId },
        { 
          isDeleted: true, 
          deletedAt: new Date(),
          content: '[Comment deleted - post removed]'
        }
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Like a post
   * @param {String} postId - Post ID
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  async likePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (post.status !== 'PUBLISHED') {
        throw new ForbiddenError('Cannot like unpublished post');
      }

      await post.like(userId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unlike a post
   * @param {String} postId - Post ID
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  async unlikePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      await post.unlike(userId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get post by ID or slug
   * @param {String} id - Post ID
   * @param {String} slug - Post slug
   * @param {Object} context - GraphQL context with user info
   * @returns {Object} Post
   */
  async getPost(id, slug, context = {}) {
    try {
      let query = {};
      
      if (id) {
        query._id = id;
      } else if (slug) {
        query.slug = slug;
      } else {
        throw new UserInputError('Either id or slug must be provided');
      }

      const post = await Post.findOne(query).populate('author');
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      // Check if user can view this post
      const canView = this.canViewPost(post, context.user);
      if (!canView) {
        throw new ForbiddenError('Not authorized to view this post');
      }

      // Increment views for published posts (don't count author's own views)
      if (post.status === 'PUBLISHED' && 
          (!context.user || post.author._id.toString() !== context.user.id)) {
        await post.incrementViews();
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get posts with filtering, sorting, and pagination
   * @param {Object} filter - Filter options
   * @param {Object} sort - Sort options
   * @param {Object} pagination - Pagination options
   * @param {Object} context - GraphQL context with user info
   * @returns {Object} Posts with pagination info
   */
  async getPosts(filter = {}, sort = {}, pagination = {}, context = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * Math.min(limit, 50); // Max 50 items per page
      const actualLimit = Math.min(limit, 50);

      // Build MongoDB filter
      let mongoFilter = { isDeleted: false };

      // Status filter
      if (filter.status) {
        mongoFilter.status = filter.status;
      } else if (!context.user) {
        // Non-authenticated users can only see published posts
        mongoFilter.status = 'PUBLISHED';
      }

      // Author filter
      if (filter.authorId) {
        mongoFilter.author = filter.authorId;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        mongoFilter.tags = { $in: filter.tags.map(tag => tag.toLowerCase()) };
      }

      // Search filter
      if (filter.search) {
        const searchRegex = new RegExp(filter.search, 'i');
        mongoFilter.$or = [
          { title: searchRegex },
          { content: searchRegex },
          { tags: { $in: [searchRegex] } }
        ];
      }

      // Build sort
      let mongoSort = {};
      if (sort.field && sort.order) {
        mongoSort[sort.field] = sort.order === 'ASC' ? 1 : -1;
      } else {
        mongoSort.createdAt = -1;
      }

      // Execute queries
      const [posts, total] = await Promise.all([
        Post.find(mongoFilter)
          .populate('author')
          .sort(mongoSort)
          .skip(skip)
          .limit(actualLimit),
        Post.countDocuments(mongoFilter)
      ]);

      // Filter posts user can view
      const viewablePosts = posts.filter(post => this.canViewPost(post, context.user));

      const totalPages = Math.ceil(total / actualLimit);

      return {
        posts: viewablePosts,
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
   * Get posts by author
   * @param {String} authorId - Author ID
   * @param {Object} pagination - Pagination options
   * @param {Object} context - GraphQL context with user info
   * @returns {Array} Posts
   */
  async getPostsByAuthor(authorId, pagination = {}, context = {}) {
    const filter = { authorId };
    return await this.getPosts(filter, {}, pagination, context);
  }

  /**
   * Get posts by tag
   * @param {String} tag - Tag name
   * @param {Object} pagination - Pagination options
   * @param {Object} context - GraphQL context with user info
   * @returns {Array} Posts
   */
  async getPostsByTag(tag, pagination = {}, context = {}) {
    const filter = { tags: [tag.toLowerCase()] };
    return await this.getPosts(filter, {}, pagination, context);
  }

  /**
   * Search posts
   * @param {String} query - Search query
   * @param {Object} pagination - Pagination options
   * @param {Object} context - GraphQL context with user info
   * @returns {Array} Posts
   */
  async searchPosts(query, pagination = {}, context = {}) {
    const filter = { search: query };
    return await this.getPosts(filter, {}, pagination, context);
  }

  /**
   * Get popular tags
   * @param {Number} limit - Number of tags to return
   * @returns {Array} Popular tags with counts
   */
  async getPopularTags(limit = 20) {
    try {
      return await Post.getPopularTags(limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get post statistics
   * @param {String} postId - Post ID (optional, for specific post stats)
   * @returns {Object} Post statistics
   */
  async getPostStats(postId = null) {
    try {
      if (postId) {
        // Get stats for specific post
        const post = await Post.findById(postId);
        if (!post) {
          throw new UserInputError('Post not found');
        }

        const [commentsCount, likesCount] = await Promise.all([
          Comment.countDocuments({ post: postId, isDeleted: false }),
          post.likesCount
        ]);

        return {
          id: post._id,
          views: post.views,
          likes: likesCount,
          comments: commentsCount,
          shares: 0 // Placeholder for future implementation
        };
      } else {
        // Get overall stats
        const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
          Post.countDocuments({ isDeleted: false }),
          Post.countDocuments({ status: 'PUBLISHED', isDeleted: false }),
          Post.countDocuments({ status: 'DRAFT', isDeleted: false }),
          Post.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
          ])
        ]);

        return {
          totalPosts,
          publishedPosts,
          draftPosts,
          totalViews: totalViews[0]?.totalViews || 0
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Publish a draft post
   * @param {String} postId - Post ID
   * @param {String} userId - User ID
   * @returns {Object} Updated post
   */
  async publishPost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (post.author.toString() !== userId) {
        throw new ForbiddenError('Not authorized to publish this post');
      }

      if (post.status === 'PUBLISHED') {
        throw new UserInputError('Post is already published');
      }

      post.status = 'PUBLISHED';
      post.publishedAt = new Date();
      
      await post.save();
      await post.populate('author');

      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive a post
   * @param {String} postId - Post ID
   * @param {String} userId - User ID
   * @returns {Object} Updated post
   */
  async archivePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (post.author.toString() !== userId) {
        throw new ForbiddenError('Not authorized to archive this post');
      }

      post.status = 'ARCHIVED';
      await post.save();
      await post.populate('author');

      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user can view a post
   * @param {Object} post - Post object
   * @param {Object} user - User object
   * @returns {Boolean} Can view post
   */
  canViewPost(post, user = null) {
    // Published posts are visible to everyone
    if (post.status === 'PUBLISHED') {
      return true;
    }

    // Draft/archived posts are only visible to:
    // 1. The author
    // 2. Admins/moderators
    if (user) {
      if (post.author._id.toString() === user.id) {
        return true;
      }
      
      if (user.role === 'admin' || user.role === 'moderator') {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user can edit a post
   * @param {Object} post - Post object
   * @param {Object} user - User object
   * @returns {Boolean} Can edit post
   */
  canEditPost(post, user) {
    if (!user) return false;

    // Author can edit their own posts
    if (post.author._id.toString() === user.id) {
      return true;
    }

    // Admins can edit any post
    if (user.role === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Duplicate a post
   * @param {String} postId - Original post ID
   * @param {String} userId - User ID
   * @returns {Object} Duplicated post
   */
  async duplicatePost(postId, userId) {
    try {
      const originalPost = await Post.findById(postId);
      
      if (!originalPost) {
        throw new UserInputError('Post not found');
      }

      if (originalPost.author.toString() !== userId) {
        throw new ForbiddenError('Not authorized to duplicate this post');
      }

      const duplicatedPost = new Post({
        title: `Copy of ${originalPost.title}`,
        content: originalPost.content,
        excerpt: originalPost.excerpt,
        status: 'DRAFT',
        featuredImage: originalPost.featuredImage,
        tags: [...originalPost.tags],
        author: userId
      });

      await duplicatedPost.save();
      await duplicatedPost.populate('author');

      return duplicatedPost;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PostService();