import mongoose from 'mongoose';

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Build nested comment tree from flat array
 * @param {Array} comments - Flat array of comments
 * @returns {Array} - Nested comment tree
 */
export const buildCommentTree = (comments) => {
  const commentMap = new Map();
  const rootComments = [];

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment._id.toString(), {
      ...comment,
      replies: []
    });
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment._id.toString());
    
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId.toString());
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

/**
 * Flatten nested comment tree to array
 * @param {Array} comments - Nested comment tree
 * @returns {Array} - Flat array of comments
 */
export const flattenCommentTree = (comments) => {
  const result = [];
  
  const flatten = (commentArray) => {
    commentArray.forEach(comment => {
      const { replies, ...commentData } = comment;
      result.push(commentData);
      
      if (replies && replies.length > 0) {
        flatten(replies);
      }
    });
  };
  
  flatten(comments);
  return result;
};

/**
 * Get comment depth in tree
 * @param {Array} comments - Nested comment tree
 * @param {string} commentId - Comment ID to find depth for
 * @returns {number} - Depth of comment (0 for root level)
 */
export const getCommentDepth = (comments, commentId) => {
  const findDepth = (commentArray, targetId, currentDepth = 0) => {
    for (const comment of commentArray) {
      if (comment._id.toString() === targetId) {
        return currentDepth;
      }
      
      if (comment.replies && comment.replies.length > 0) {
        const depth = findDepth(comment.replies, targetId, currentDepth + 1);
        if (depth !== -1) {
          return depth;
        }
      }
    }
    return -1;
  };
  
  return findDepth(comments, commentId);
};

/**
 * Filter comments by criteria
 * @param {Array} comments - Comments to filter
 * @param {Object} criteria - Filter criteria
 * @returns {Array} - Filtered comments
 */
export const filterComments = (comments, criteria) => {
  const { authorId, dateFrom, dateTo, contentContains } = criteria;
  
  return comments.filter(comment => {
    let matches = true;
    
    if (authorId && comment.author._id.toString() !== authorId) {
      matches = false;
    }
    
    if (dateFrom && new Date(comment.createdAt) < new Date(dateFrom)) {
      matches = false;
    }
    
    if (dateTo && new Date(comment.createdAt) > new Date(dateTo)) {
      matches = false;
    }
    
    if (contentContains && !comment.content.toLowerCase().includes(contentContains.toLowerCase())) {
      matches = false;
    }
    
    return matches;
  });
};

/**
 * Sort comments by criteria
 * @param {Array} comments - Comments to sort
 * @param {string} sortBy - Sort criteria ('newest', 'oldest', 'author')
 * @returns {Array} - Sorted comments
 */
export const sortComments = (comments, sortBy = 'newest') => {
  const sortedComments = [...comments];
  
  switch (sortBy) {
    case 'oldest':
      return sortedComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'author':
      return sortedComments.sort((a, b) => a.author.username.localeCompare(b.author.username));
    case 'newest':
    default:
      return sortedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

/**
 * Calculate comment statistics
 * @param {Array} comments - Comments to analyze
 * @returns {Object} - Comment statistics
 */
export const calculateCommentStats = (comments) => {
  const stats = {
    total: comments.length,
    topLevel: 0,
    replies: 0,
    authors: new Set(),
    avgLength: 0,
    maxDepth: 0
  };
  
  let totalLength = 0;
  const flatComments = flattenCommentTree(comments);
  
  flatComments.forEach(comment => {
    if (!comment.parentCommentId) {
      stats.topLevel++;
    } else {
      stats.replies++;
    }
    
    stats.authors.add(comment.author._id.toString());
    totalLength += comment.content.length;
    
    const depth = getCommentDepth(comments, comment._id.toString());
    if (depth > stats.maxDepth) {
      stats.maxDepth = depth;
    }
  });
  
  stats.avgLength = stats.total > 0 ? Math.round(totalLength / stats.total) : 0;
  stats.uniqueAuthors = stats.authors.size;
  delete stats.authors; // Remove Set object from final result
  
  return stats;
};