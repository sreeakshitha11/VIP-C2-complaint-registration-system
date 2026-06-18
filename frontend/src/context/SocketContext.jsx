import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let socketInstance = null;

    if (user) {
      // Setup socket connection
      // Vite proxy handles path forwarding to backend on http://localhost:5001
      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin;
      socketInstance = io(socketUrl, {
        transports: ['websocket'],
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket client connected. ID:', socketInstance.id);
      });
    }

    // Clean up
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        console.log('Socket client disconnected');
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
