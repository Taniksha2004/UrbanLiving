import { Request, Response, NextFunction } from 'express';
import Message from '../models/message.model';

/**
 * @desc    Get conversation history
 * @route   GET /api/messages/:recipientId
 * @access  Private
 */
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ FIX: Cast req.user to 'any' to access userId without TS errors
    const loggedInUserId = (req.user as any)?.userId; 
    
    const { recipientId } = req.params;

    if (!loggedInUserId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required in the URL.' });
    }

    // 3. Find messages matching the conversation pair
    const conversationMessages = await Message.find({
      $or: [
        { sender: loggedInUserId, receiver: recipientId },
        { sender: recipientId, receiver: loggedInUserId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({ messages: conversationMessages });

  } catch (error) {
    console.error("Error in getMessages controller:", error);
    next(error); 
  }
};