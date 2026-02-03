import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import User from '../models/user.model';

// Helper to safely parse JSON strings from FormData
const safeJsonParse = (str: any, defaultValue: any) => {
  if (typeof str !== 'string') return str || defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId;

    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ message: 'A profile already exists for this user.' });
    }

    const { body, files } = req;
    const imageFiles = files as Express.Multer.File[];
    const imagePaths = imageFiles ? imageFiles.map(file => `/uploads/profiles/${file.filename}`) : [];

    // ✅ This logic now correctly maps your detailed form data to your model
    const profileData = {
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      age: Number(body.age),
      gender: body.gender,
      occupation: body.occupation,
      bio: body.bio,
      preferredCities: safeJsonParse(body.preferredCities, []),
      preferredAreas: body.preferredAreas,
      maxCommute: body.maxCommute,
      budgetMin: Number(body.budgetMin),
      budgetMax: Number(body.budgetMax),
      lifestyle: safeJsonParse(body.lifestyle, {}),
      interests: safeJsonParse(body.interests, []),
      roomType: body.roomType,
      genderPreference: body.genderPreference,
      ageRange: safeJsonParse(body.ageRange, {}),
      profileImages: imagePaths,
      languages: safeJsonParse(body.languages, []),
      workSchedule: body.workSchedule,
      dealBreakers: safeJsonParse(body.dealBreakers, []),
    };

    const newProfile = new Profile(profileData);
    await newProfile.save();
    res.status(201).json({ message: 'Profile created successfully!', profile: newProfile });

  } catch (error: any) {
    console.error("CREATE PROFILE FAILED:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A profile already exists for this user.' });
    }
    // Provide a more detailed validation error message
    res.status(500).json({ message: 'Server error: Please check all required fields.', error: error.message });
  }
};

// --- Other functions (getMyProfile, getAllProfiles, deleteMyProfile) remain the same ---

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) { return res.status(401).json({ message: 'Authentication required.' }); }
    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) { return res.status(404).json({ message: 'Profile not found. Please create one.' }); }
    res.status(200).json({ profile });
  } catch (error) { res.status(500).json({ message: 'Server error while fetching profile.' }); }
};

export const getAllProfiles = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) { return res.status(401).json({ message: 'Authentication required.' }); }
    const profiles = await Profile.find({ userId: { $ne: req.user.userId } });
    res.status(200).json({ profiles });
  } catch (error) { res.status(500).json({ message: 'Server error while fetching profiles.' }); }
};

export const deleteMyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) { return res.status(401).json({ message: 'Authentication required.' }); }
    const deletedProfile = await Profile.findOneAndDelete({ userId: req.user.userId });
    if (!deletedProfile) { return res.status(404).json({ message: 'Profile not found.' }); }
    res.status(200).json({ message: 'Profile deleted successfully.' });
  } catch (error) { res.status(500).json({ message: 'Server error while deleting profile.' }); }
};

// ✅ NEW: Like a profile
export const likeProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { profileId } = req.params;
    const userId = req.user.userId;

    // Check if the profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if already liked
    if (user.likedProfiles && user.likedProfiles.includes(profileId)) {
      return res.status(409).json({ message: 'You have already liked this profile.' });
    }

    // Add the profile to liked profiles
    if (!user.likedProfiles) {
      user.likedProfiles = [];
    }
    user.likedProfiles.push(profileId);
    await user.save();

    res.status(200).json({ message: 'Profile liked successfully!', likedProfiles: user.likedProfiles });
  } catch (error: any) {
    console.error("LIKE PROFILE FAILED:", error);
    res.status(500).json({ message: 'Server error while liking profile.', error: error.message });
  }
};

// ✅ NEW: Unlike a profile
export const unlikeProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { profileId } = req.params;
    const userId = req.user.userId;

    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Remove the profile from liked profiles
    if (!user.likedProfiles || !user.likedProfiles.includes(profileId)) {
      return res.status(404).json({ message: 'Profile not found in your likes.' });
    }

    user.likedProfiles = user.likedProfiles.filter((id) => id !== profileId);
    await user.save();

    res.status(200).json({ message: 'Profile unliked successfully!', likedProfiles: user.likedProfiles });
  } catch (error: any) {
    console.error("UNLIKE PROFILE FAILED:", error);
    res.status(500).json({ message: 'Server error while unliking profile.', error: error.message });
  }
};

// ✅ NEW: Get all liked profiles
export const getMyLikes = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ likedProfiles: user.likedProfiles || [] });
  } catch (error: any) {
    console.error("GET LIKES FAILED:", error);
    res.status(500).json({ message: 'Server error while fetching likes.', error: error.message });
  }
};

// ✅ NEW: Get a specific profile by ID
export const getProfileById = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { profileId } = req.params;
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.status(200).json({ profile });
  } catch (error: any) {
    console.error("GET PROFILE BY ID FAILED:", error);
    res.status(500).json({ message: 'Server error while fetching profile.', error: error.message });
  }
};