// templates/node-express/1.0.0/graphql/schema/resolvers.js
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType, Kind } = require('graphql');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const authService = require('../services/authService');
const postService = require('../services/postService');
const userService = require('../services/userService');
const { validateInput } = require('../utils/validation');

// Custom Date scalar
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

// Helper function to require authentication
const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  return user;
};

// Helper function for pagination
const getPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 100) }; // Max 100 items per page
};

const resolvers = {
  Date: DateScalar,

  // Type Resolvers
  User: {
    posts: async (parent, args, { user }) => {
      return await Post.find({ author: parent.id })
        .populate('author')
        .sort({ createdAt: -1 });
    },
    postCount: async (parent) => {
      return await Post.countDocuments({ author: parent.id });
    }
  },

  Post: {
    author: async (parent) => {
      return await User.findById(parent.author);
    },
    excerpt: (parent) => {
      if (parent.excerpt) return parent.excerpt;
      return parent.content.length > 150 
        ? parent.content.substring(0, 150) + '...' 
        : parent.content;
    },
    likesCount: async (parent) => {
      return parent.likes ? parent.likes.length : 0;
    },
    commentsCount: async (parent) => {
      return await Comment.countDocuments({ post: parent.id });
    }
  },

  Comment: {
    author: async (parent) => {
      return await User.findById(parent.author);
    },
    post: async (parent) => {
      return await Post.findById(parent.post);
    }
  },

  // Query Resolvers
  Query: {
    // User Queries
    me: async (parent, args, { user }) => {
      requireAuth(user);
      return await User.findById(user.id);
    },

    user: async (parent, { id }) => {
      const foundUser = await User.findById(id);
      if (!foundUser) {
        throw new UserInputError('User not found');
      }
      return foundUser;
    },

    users: async (parent, { pagination, search }) => {
      const { skip, limit } = getPagination(pagination?.page, pagination?.limit);
      
      let filter = {};
      if (search) {
        filter = {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);
      const currentPage = pagination?.page || 1;

      return {
        users,
        pagination: {
          currentPage,
          totalPages,
          totalItems: total,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      };
    },

    // Post Queries
    post: async (parent, { id, slug }) => {
      if (id) {
        return await Post.findById(id).populate('author');
      }
      if (slug) {
        return await Post.findOne({ slug }).populate('author');
      }
      throw new UserInputError('Either id or slug must be provided');
    },

    posts: async (parent, { filter, sort, pagination }) => {
      const { skip, limit } = getPagination(pagination?.page, pagination?.limit);
      
      // Build filter
      let mongoFilter = {};
      if (filter) {
        if (filter.status) mongoFilter.status = filter.status;
        if (filter.authorId) mongoFilter.author = filter.authorId;
        if (filter.tags && filter.tags.length > 0) {
          mongoFilter.tags = { $in: filter.tags };
        }
        if (filter.search) {
          mongoFilter.$or = [
            { title: { $regex: filter.search, $options: 'i' } },
            { content: { $regex: filter.search, $options: 'i' } },
            { tags: { $in: [new RegExp(filter.search, 'i')] } }
          ];
        }
      }

      // Build sort
      let mongoSort = {};
      if (sort) {
        mongoSort[sort.field] = sort.order === 'ASC' ? 1 : -1;
      } else {
        mongoSort.createdAt = -1;
      }

      const [posts, total] = await Promise.all([
        Post.find(mongoFilter)
          .populate('author')
          .sort(mongoSort)
          .skip(skip)
          .limit(limit),
        Post.countDocuments(mongoFilter)
      ]);

      const totalPages = Math.ceil(total / limit);
      const currentPage = pagination?.page || 1;

      return {
        posts,
        pagination: {
          currentPage,
          totalPages,
          totalItems: total,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      };
    },

    // Comment Queries
    comments: async (parent, { postId, pagination }) => {
      const { skip, limit } = getPagination(pagination?.page, pagination?.limit);
      
      return await Comment.find({ post: postId })
        .populate('author')
        .populate('post')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    },

    // Stats Query
    stats: async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [totalUsers, totalPosts, totalComments, postsToday, activeUsers] = await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Comment.countDocuments(),
        Post.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ lastActivity: { $gte: new Date(now - 24 * 60 * 60 * 1000) } })
      ]);

      return {
        totalUsers,
        totalPosts,
        totalComments,
        postsToday,
        activeUsers
      };
    }
  },

  // Mutation Resolvers
  Mutation: {
    // User Mutations
    register: async (parent, { input }) => {
      const validation = validateInput('createUser', input);
      if (!validation.isValid) {
        throw new UserInputError('Validation failed', { validationErrors: validation.errors });
      }

      return await authService.register(input);
    },

    login: async (parent, { email, password }) => {
      return await authService.login(email, password);
    },

    updateProfile: async (parent, { input }, { user }) => {
      requireAuth(user);
      return await userService.updateProfile(user.id, input);
    },

    deleteAccount: async (parent, args, { user }) => {
      requireAuth(user);
      await userService.deleteAccount(user.id);
      return { success: true, message: 'Account deleted successfully' };
    },

    // Post Mutations
    createPost: async (parent, { input }, { user }) => {
      requireAuth(user);
      
      const validation = validateInput('createPost', input);
      if (!validation.isValid) {
        throw new UserInputError('Validation failed', { validationErrors: validation.errors });
      }

      return await postService.createPost(user.id, input);
    },

    updatePost: async (parent, { id, input }, { user }) => {
      requireAuth(user);
      
      const post = await Post.findById(id);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (post.author.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to update this post');
      }

      return await postService.updatePost(id, input);
    },

    deletePost: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const post = await Post.findById(id);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (post.author.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to delete this post');
      }

      await postService.deletePost(id);
      return { success: true, message: 'Post deleted successfully' };
    },

    likePost: async (parent, { id }, { user }) => {
      requireAuth(user);
      await postService.likePost(id, user.id);
      return { success: true, message: 'Post liked successfully' };
    },

    unlikePost: async (parent, { id }, { user }) => {
      requireAuth(user);
      await postService.unlikePost(id, user.id);
      return { success: true, message: 'Post unliked successfully' };
    },

    // Comment Mutations
    createComment: async (parent, { input }, { user }) => {
      requireAuth(user);
      
      const post = await Post.findById(input.postId);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      const comment = new Comment({
        content: input.content,
        author: user.id,
        post: input.postId
      });

      await comment.save();
      await comment.populate(['author', 'post']);
      
      return comment;
    },

    updateComment: async (parent, { id, content }, { user }) => {
      requireAuth(user);
      
      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      if (comment.author.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to update this comment');
      }

      comment.content = content;
      comment.updatedAt = new Date();
      await comment.save();
      await comment.populate(['author', 'post']);
      
      return comment;
    },

    deleteComment: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      if (comment.author.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to delete this comment');
      }

      await Comment.findByIdAndDelete(id);
      return { success: true, message: 'Comment deleted successfully' };
    }
  }
};

module.exports = resolvers;