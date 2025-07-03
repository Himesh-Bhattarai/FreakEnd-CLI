import { body, param } from 'express-validator';
import mongoose from 'mongoose';

// Validation for creating a comment
export const validateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .escape(),
  
  body('postId')
    .notEmpty()
    .withMessage('Post ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid post ID format');
      }
      return true;
    }),
  
  body('parentCommentId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid parent comment ID format');
      }
      return true;
    })
];

// Validation for updating a comment
export const validateCommentUpdate = [
  param('commentId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid comment ID format');
      }
      return true;
    }),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .escape()
];

// Validation for comment ID parameter
export const validateCommentId = [
  param('commentId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid comment ID format');
      }
      return true;
    })
];

// Validation for post ID parameter
export const validatePostId = [
  param('postId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid post ID format');
      }
      return true;
    })
];