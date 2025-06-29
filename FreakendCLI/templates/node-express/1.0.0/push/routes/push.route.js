import express from 'express';
import { subscribe, unsubscribe, sendPush } from '../controllers/push.controller.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/subscribe', authenticateToken, subscribe);
router.delete('/unsubscribe', authenticateToken, unsubscribe);
router.post('/push', authenticateToken, sendPush);

export default router;

