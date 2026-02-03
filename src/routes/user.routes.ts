// src/routes/user.routes.ts

import { Router, Request, Response } from 'express'; // Ensure Request & Response are imported
import { authenticateJWT } from '../middlewares/auth';
import User from '../models/user.model';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// --- Route Handlers ---

// GET Current User's Profile
router.get('/profile', authenticateJWT, async (req: Request, res: Response) => {
  // ✅ TYPE GUARD ADDED
  if (!req.user || !('userId' in req.user)) {
    return res.status(401).json({ message: 'User not found in token.' });
  }

  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// PATCH (Update) Current User's Profile
router.patch('/profile', authenticateJWT, upload.single('avatar'), async (req: Request, res: Response) => {
  // ✅ TYPE GUARD ADDED
  if (!req.user || !('userId' in req.user)) {
    return res.status(401).json({ message: 'User not found in token.' });
  }
  
  const { userId } = req.user;
  const { firstName, lastName } = req.body;
  const avatarFile = req.file;

  try {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (avatarFile && userToUpdate.avatarUrl) {
      const oldAvatarPath = path.resolve(process.cwd(), userToUpdate.avatarUrl.substring(1));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const updateData: { firstName?: string; lastName?: string; avatarUrl?: string } = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (avatarFile) {
      updateData.avatarUrl = `/uploads/${avatarFile.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Could not update profile' });
  }
});

// GET /users/:id (Unprotected, no change needed)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Example of a protected route
router.get('/protected-test', authenticateJWT, (req: Request, res: Response) => {
  // ✅ Check for BOTH userId and userType
  if (!req.user || !('userId' in req.user) || !('userType' in req.user)) {
    return res.status(401).json({ message: 'User information is incomplete in token.' });
  }

  res.status(200).json({
    message: 'Access granted.',
    userId: req.user.userId,
    userRole: req.user.userType
  });
});

export default router;