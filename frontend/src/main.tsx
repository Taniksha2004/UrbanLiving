import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Import the AuthProvider
import { AuthProvider } from './context/AuthContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { MatchesProvider } from './context/MatchesContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Wrap your App component with the AuthProvider */}
    <AuthProvider>
      <MatchesProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </MatchesProvider>
    </AuthProvider>
  </StrictMode>
);