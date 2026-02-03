import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  X,
  MapPin,
  Star,
  MessageCircle,
  User,
  Coffee,
  Moon,
  Utensils
} from 'lucide-react';

// ✅ 1. Import our authenticated API client
import apiClient from '../apiClient';
// ✅ 2. Import the MatchesContext to update global state
import { useMatches } from '../context/MatchesContext'; 

// Define the shape of a single profile from your database
type Profile = {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  budgetMin: number;
  budgetMax: number;
  preferredCities: string[];
  profileImages: string[];
  bio: string;
  interests: string[];
  lifestyle: {
    cleanliness: number;
    socialness: number;
    nightOwl: number;
    cooking: number;
  };
};

const HomeMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { addMatch, likedProfiles } = useMatches(); // ✅ Get addMatch function and likedProfiles from context
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 2. This useEffect hook is now corrected to use apiClient
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        // Use apiClient for the authenticated request
        const response = await apiClient.get('/profiles');
        
        // The data is inside response.data.profiles
        setProfiles(response.data.profiles || []);

      } catch (error) {
        console.error("Error fetching profiles:", error);
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!profiles.length) return;

    if (direction === 'right' && profiles[currentIndex]) {
      const profileId = profiles[currentIndex]._id;
      console.log('Liked:', profiles[currentIndex].firstName);
      
      // ✅ Call the addMatch function to update global state and API
      addMatch(profileId).catch((error) => {
        console.error('Error liking profile:', error);
        alert('Failed to like this profile. Please try again.');
      });
    }
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  const handleStartChat = (recipientId: string) => {
    // Navigate to the chat page, passing the recipient's user ID
    navigate(`/chat/${recipientId}`); 
  };
  const getLifestyleIcon = (type: string) => {
    switch (type) {
      case 'cleanliness': return <Utensils className="h-4 w-4" />;
      case 'socialness': return <User className="h-4 w-4" />;
      case 'nightOwl': return <Moon className="h-4 w-4" />;
      case 'cooking': return <Coffee className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getLifestyleLabel = (type: string) => {
    switch (type) {
      case 'cleanliness': return 'Cleanliness';
      case 'socialness': return 'Social';
      case 'nightOwl': return 'Night Owl';
      case 'cooking': return 'Cooking';
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Loading Matches...</div>;
  }

  if (!profiles || profiles.length === 0) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-2xl font-bold text-white">No More Profiles</h1>
            <p className="text-gray-400 mt-2">You've seen everyone for now. Check back later for new roommate matches!</p>
        </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            HomeMatch
          </h1>
          <p className="text-gray-400">Find your perfect roommate</p>
        </div>

        {/* Profile Card */}
        <motion.div
          key={currentProfile._id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden mb-8"
        >
          {/* Profile Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={`http://localhost:4000${currentProfile.profileImages?.[0]}`}
              alt={`${currentProfile.firstName}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600/111827/4b5563?text=No+Photo' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-48"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.firstName}, {currentProfile.age}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{currentProfile.preferredCities?.[0] || 'Any Location'}</span>
                </div>
                <div className="flex items-center space-x-1"> 
                  <span className="text-sm">₹{currentProfile.budgetMin} - ₹{currentProfile.budgetMax}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <p className="text-gray-300 mb-6">{currentProfile.bio}</p>
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-white mb-3">Lifestyle</h3>
              {currentProfile.lifestyle && Object.entries(currentProfile.lifestyle).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3 text-gray-300">
                  <div className="flex items-center space-x-2 w-28 text-sm">
                    {getLifestyleIcon(key)}
                    <span>{getLifestyleLabel(key)}</span>
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${(value as number) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{value}/10</span>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('left')} className="bg-gray-800 shadow-lg rounded-full p-4 text-gray-400 hover:bg-gray-700 transition-colors duration-200">
            <X className="h-8 w-8" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => handleSwipe('right')}
            className={`shadow-lg rounded-full p-4 transition-all duration-200 ${
              likedProfiles.includes(currentProfile._id)
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-8 w-8 ${likedProfiles.includes(currentProfile._id) ? 'fill-current' : ''}`} />
          </motion.button>  
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            // Call handleStartChat with the userId of the profile being viewed
            onClick={() => handleStartChat(currentProfile._id)} 
            className="bg-gray-800 shadow-lg rounded-full p-4 text-gray-400 hover:bg-gray-700 transition-colors duration-200"
          >
            <MessageCircle className="h-8 w-8" />
          </motion.button>
        </div>

      </div>
    </div>
  );
};

export default HomeMatchPage;