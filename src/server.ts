import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Message from './models/message.model';

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    socket.data.userId = userId;
    console.log(`User ${socket.id} (User ID: ${userId}) joined room ${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    const senderId = socket.data.userId; 

    if (!senderId || !data.recipientId || !data.message) {
        console.error("sendMessage error: Missing data", { senderId, recipientId: data.recipientId, message: data.message });
        return; 
    }
    
    console.log(`Received message from ${senderId} to ${data.recipientId}: ${data.message}`);

    try {
      // ✅ Save using 'sender', 'receiver', 'content' to match Schema
      const newMessage = new Message({
        sender: senderId,
        receiver: data.recipientId,
        content: data.message,
        timestamp: new Date() 
      });
      await newMessage.save();
      console.log('💾 Message saved to DB:', newMessage._id);

      // Emit the full saved message object (which has sender/receiver/content fields)
      io.to(data.recipientId).emit('receiveMessage', newMessage.toObject()); 
      io.to(senderId).emit('receiveMessage', newMessage.toObject());

    } catch (error) {
      console.error('❌ Error saving or emitting message:', error);
      socket.emit('sendMessageError', { message: 'Failed to send or save message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id} (User ID: ${socket.data.userId})`);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server (with Socket.IO) running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();