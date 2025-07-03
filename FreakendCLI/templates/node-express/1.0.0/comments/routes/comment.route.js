import express from 'express';
import commentController from '../controllers/comment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateComment, validateCommentUpdate } from '../middleware/comment.middleware.js';

const router = express.Router();

// Public routes
router.get('/:postId', commentController.getCommentsByPost);
router.get('/single/:commentId', commentController.getComment);
router.get('/stats/:postId', commentController.getCommentStats);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/', validateComment, commentController.createComment);
router.put('/:commentId', validateCommentUpdate, commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;