import Comment from '../models/comment.model.js';
import { buildCommentTree, validateObjectId } from '../utils/comment.utils.js';
import { validationResult } from 'express-validator';

class CommentController {
  // Create a new comment
  async createComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { content, postId, parentCommentId } = req.body;
      const userId = req.user.id;

      // Validate parent comment exists if provided
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment || parentComment.isDeleted) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
        
        // Ensure parent comment belongs to the same post
        if (parentComment.postId.toString() !== postId) {
          return res.status(400).json({
            success: false,
            message: 'Parent comment does not belong to this post'
          });
        }
      }

      const comment = new Comment({
        content,
        postId,
        parentCommentId: parentCommentId || null,
        author: userId
      });

      await comment.save();
      
      // Populate author for response
      await comment.populate('author', 'username email avatar');

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all comments for a post (nested)
  async getCommentsByPost(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 50, sort = 'createdAt' } = req.query;

      if (!validateObjectId(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID'
        });
      }

      const skip = (page - 1) * limit;
      const sortOrder = sort === 'oldest' ? 1 : -1;

      // Get all comments for the post
      const comments = await Comment.findActive({ postId })
        .populate('author', 'username email avatar')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Build nested comment tree
      const commentTree = buildCommentTree(comments);

      // Get total count for pagination
      const totalComments = await Comment.countDocuments({
        postId,
        isDeleted: false
      });

      res.json({
        success: true,
        message: 'Comments retrieved successfully',
        data: {
          comments: commentTree,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalComments / limit),
            totalComments,
            hasNext: page * limit < totalComments,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve comments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update a comment
  async updateComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!validateObjectId(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID'
        });
      }

      const comment = await Comment.findById(commentId);
      
      if (!comment || comment.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check if user is the author
      if (comment.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own comments'
        });
      }

      comment.content = content;
      await comment.save();

      await comment.populate('author', 'username email avatar');

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete a comment (and all its replies)
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      if (!validateObjectId(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID'
        });
      }

      const comment = await Comment.findById(commentId);
      
      if (!comment || comment.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check if user is the author
      if (comment.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      // Soft delete the comment and all its replies
      await this.deleteCommentAndReplies(commentId);

      res.json({
        success: true,
        message: 'Comment and its replies deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a single comment
  async getComment(req, res) {
    try {
      const { commentId } = req.params;

      if (!validateObjectId(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID'
        });
      }

      const comment = await Comment.findById(commentId)
        .populate('author', 'username email avatar')
        .populate({
          path: 'replies',
          populate: {
            path: 'author',
            select: 'username email avatar'
          }
        });

      if (!comment || comment.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      res.json({
        success: true,
        message: 'Comment retrieved successfully',
        data: comment
      });
    } catch (error) {
      console.error('Get comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to recursively delete comment and its replies
  async deleteCommentAndReplies(commentId) {
    // Find all replies to this comment
    const replies = await Comment.find({
      parentCommentId: commentId,
      isDeleted: false
    });

    // Recursively delete all replies
    for (const reply of replies) {
      await this.deleteCommentAndReplies(reply._id);
    }

    // Soft delete the comment
    await Comment.findByIdAndUpdate(commentId, {
      isDeleted: true,
      deletedAt: new Date()
    });
  }

  // Get comment statistics
  async getCommentStats(req, res) {
    try {
      const { postId } = req.params;

      if (!validateObjectId(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID'
        });
      }

      const stats = await Comment.aggregate([
        {
          $match: {
            postId: new mongoose.Types.ObjectId(postId),
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            topLevelComments: {
              $sum: {
                $cond: [{ $eq: ['$parentCommentId', null] }, 1, 0]
              }
            },
            replies: {
              $sum: {
                $cond: [{ $ne: ['$parentCommentId', null] }, 1, 0]
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalComments: 0,
        topLevelComments: 0,
        replies: 0
      };

      res.json({
        success: true,
        message: 'Comment statistics retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get comment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve comment statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new CommentController();