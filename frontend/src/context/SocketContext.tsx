import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming you have AuthContext

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps { children: ReactNode; }

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); // Get logged-in user info

  useEffect(() => {
    if (user) {
      // Connect when user logs in
      const newSocket = io("http://localhost:4000"); // Your backend URL
      setSocket(newSocket);

      // Join the user-specific room
      newSocket.emit('joinRoom', user.userId); 

      return () => {
        // Disconnect when user logs out or component unmounts
        newSocket.disconnect();
      };
    } else {
      // If user logs out, disconnect existing socket
      socket?.disconnect();
      setSocket(null);
    }
  }, [user]); // Re-run effect when user changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};