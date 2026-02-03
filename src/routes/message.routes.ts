import { Router } from 'express';
import { getMessages } from '../controllers/message.controller'; // Only import getMessages
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// GET /api/messages/:recipientId
// Fetches the chat history between the logged-in user and the specified recipient
// This route is protected by authenticateJWT
router.get(
  '/:recipientId', 
  authenticateJWT, 
  getMessages
);

// We removed the router.post('/') because sending messages is handled by Socket.IO

export default router;