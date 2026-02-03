import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // ✅ 1. Import the Node.js File System module

// Security and Controller Imports
import { authenticateJWT } from '../middlewares/auth';
import { checkRole } from '../middlewares/role.middleware';
import { 
  createProfile, 
  getAllProfiles, 
  getMyProfile, 
  deleteMyProfile,
  likeProfile,
  unlikeProfile,
  getMyLikes,
  getProfileById
} from '../controllers/profile.controller';

const router = Router();

// ✅ 2. Define the upload directory and ensure it exists
const uploadDir = 'uploads/profiles';
// The { recursive: true } option creates parent directories if they don't exist
fs.mkdirSync(uploadDir, { recursive: true });


// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use the variable we defined
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use 'profileImages' to match the field name in your form
    cb(null, 'profileImages' + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// --- Route Definitions (These remain the same) ---

// GET /api/profiles/
router.get('/', authenticateJWT, checkRole(['student']), getAllProfiles);

// GET /api/profiles/me
router.get('/me', authenticateJWT, checkRole(['student']), getMyProfile);

// POST /api/profiles/
router.post(
  '/', 
  authenticateJWT, 
  checkRole(['student']), 
  upload.array('profileImages', 3), 
  createProfile
);

// DELETE /api/profiles/me
router.delete('/me', authenticateJWT, checkRole(['student']), deleteMyProfile);

// ✅ NEW: Like a profile
router.post('/like/:profileId', authenticateJWT, checkRole(['student']), likeProfile);

// ✅ NEW: Unlike a profile
router.delete('/like/:profileId', authenticateJWT, checkRole(['student']), unlikeProfile);

// ✅ NEW: Get all liked profiles
router.get('/my-likes', authenticateJWT, checkRole(['student']), getMyLikes);

// ✅ NEW: Get a specific profile by ID
router.get('/:profileId', authenticateJWT, checkRole(['student']), getProfileById);

export default router;