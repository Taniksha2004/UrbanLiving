import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateJWT } from '../middlewares/auth'; // Import for JWT
import { checkRole } from '../middlewares/role.middleware'; // Import for RBAC
import { createProperty, getAllProperties, deleteProperty, getMyProperties, updateProperty } from '../controllers/property.controller';

const router = Router();

// This tells multer where to save the files and how to name them.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be saved in the 'uploads' directory at the root of your backend
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent files with the same name from overwriting each other
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// This creates the 'upload' middleware using the storage configuration
const upload = multer({ storage: storage });

// POST /api/properties/
// 🔑 Only 'property-owner' can create a new property
router.post(
    '/', 
    authenticateJWT, // 1. Verify user is logged in
    checkRole(['property-owner']), // 2. Verify user role
    upload.array('images', 10), 
    createProperty
);

// GET /api/properties/

// 🔒 All authenticated users can view properties
router.get('/', getAllProperties);
router.get(
  '/my-listings',
  authenticateJWT,
  checkRole(['property-owner', 'vendor']), // Or just property-owner
  getMyProperties
);

// PUT /api/properties/:id
// 🔑 Only 'property-owner' can edit their own properties
router.put(
  '/:id',
  authenticateJWT,
  checkRole(['property-owner']),
  upload.array('images', 10),
  updateProperty
);

router.delete(
  '/:id',
  authenticateJWT,
  checkRole(['property-owner']),
  deleteProperty
);



export default router;
