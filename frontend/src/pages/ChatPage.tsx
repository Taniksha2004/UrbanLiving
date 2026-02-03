import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send } from 'lucide-react';

// Interface matching your MongoDB schema
interface IMessage {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string | Date;
}

const ChatPage: React.FC = () => {
  const { recipientId } = useParams<{ recipientId: string }>();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientName, setRecipientName] = useState('Chat');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial chat history
  useEffect(() => {
    const loadChat = async () => {
      if (!recipientId || !user) return;
      setIsLoading(true);
      try {
        const messagesRes = await apiClient.get(`/messages/${recipientId}`);
        setMessages(messagesRes.data.messages || []);

        // Optional: Fetch recipient details to show their name instead of 'Chat'
        // const userRes = await apiClient.get(`/users/${recipientId}`);
        // setRecipientName(userRes.data.firstName);
      } catch (error) {
        console.error("Failed to load chat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChat();
  }, [recipientId, user]);

  // Listen for real-time messages
  useEffect(() => {
    if (socket) {
      const messageListener = (incomingMessage: IMessage) => {
        // Only add message if it belongs to this specific conversation
        if (
          (incomingMessage.sender === recipientId) || 
          (incomingMessage.receiver === recipientId && incomingMessage.sender === user?.userId)
        ) {
          setMessages(prev => [...prev, incomingMessage]);
        }
      };

      socket.on('receiveMessage', messageListener);
      return () => { socket.off('receiveMessage', messageListener); };
    }
  }, [socket, recipientId, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user && recipientId) {
      const messageData: IMessage = {
        sender: user.userId,
        receiver: recipientId,
        content: newMessage,
        timestamp: new Date()
      };
      
      // Emit to server
      socket.emit('sendMessage', {
        senderId: user.userId,
        recipientId: recipientId,
        message: newMessage
      });

      // Optimistically update UI
      setMessages(prev => [...prev, messageData]); 
      setNewMessage('');
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-black text-gray-400">Loading chat...</div>;

  return (
    // Main container: Fixed height subtracting the Navbar (approx 64px)
    <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-white">
      
      {/* Chat Header */}
      <div className="bg-gray-900 p-4 flex items-center border-b border-gray-800 shadow-md z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-100">{recipientName}</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area - Grows to fill space and scrolls internally */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.map((msg, index) => {
          const isMyMessage = msg.sender === user?.userId;

          return (
            <div 
              key={msg._id || index} 
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-3 text-sm shadow-md ${
                  isMyMessage 
                    ? 'bg-white text-black rounded-2xl rounded-tr-none' 
                    : 'bg-gray-800 text-white rounded-2xl rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <span 
                  className={`text-[10px] block text-right mt-1 opacity-70 ${
                    isMyMessage ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="p-4 bg-black border-t border-gray-800">
        <form 
          onSubmit={handleSendMessage} 
          className="flex items-center gap-2 bg-gray-900 p-2 rounded-full border border-gray-700 focus-within:border-gray-500 transition-colors shadow-lg"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-4 py-2 text-white focus:outline-none placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;