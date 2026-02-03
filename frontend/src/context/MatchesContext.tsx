// src/context/MatchesContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import apiClient from '../apiClient';
import { useAuth } from './AuthContext';

interface IMatchesContext {
  totalMatches: number;
  likedProfiles: string[]; // Array of profile IDs that the user has liked
  isLoading: boolean;
  addMatch: (profileId: string) => Promise<void>;
  removeMatch: (profileId: string) => Promise<void>;
  fetchMatches: () => Promise<void>;
}

const MatchesContext = createContext<IMatchesContext | null>(null);

interface MatchesProviderProps {
  children: ReactNode;
}

export const MatchesProvider: React.FC<MatchesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [totalMatches, setTotalMatches] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch the user's current matches/likes when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  // ✅ Fetch all likes from the backend
  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/profiles/my-likes');
      const likedProfileIds = response.data.likedProfiles || [];
      setLikedProfiles(likedProfileIds);
      setTotalMatches(likedProfileIds.length);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setLikedProfiles([]);
      setTotalMatches(0);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Add a new like/match
  const addMatch = async (profileId: string) => {
    try {
      await apiClient.post(`/profiles/like/${profileId}`);
      
      // Update local state immediately
      if (!likedProfiles.includes(profileId)) {
        setLikedProfiles([...likedProfiles, profileId]);
        setTotalMatches((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error adding match:", error);
      throw error;
    }
  };

  // ✅ Remove a like/match
  const removeMatch = async (profileId: string) => {
    try {
      await apiClient.delete(`/profiles/like/${profileId}`);
      
      // Update local state immediately
      setLikedProfiles(likedProfiles.filter((id) => id !== profileId));
      setTotalMatches((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error removing match:", error);
      throw error;
    }
  };

  return (
    <MatchesContext.Provider
      value={{
        totalMatches,
        likedProfiles,
        isLoading,
        addMatch,
        removeMatch,
        fetchMatches,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = (): IMatchesContext => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};
