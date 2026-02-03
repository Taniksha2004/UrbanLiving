// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface IUser {
  userId: string;
  email: string;
  userType: string;
}

interface IAuthContext {
  user: IUser | null;
  isLoading: boolean; // ✅ Add isLoading state
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Initialize isLoading to true

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser: IUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setIsLoading(false); // ✅ Set isLoading to false after checking token
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedUser: IUser = jwtDecode(token);
    setUser(decodedUser);
    setIsLoading(false); // Ensure loading is false on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoading(false); // Ensure loading is false on logout
  };

  return (
    // ✅ Pass isLoading in the context value
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};