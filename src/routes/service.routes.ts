// src/routes/service.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middlewares/auth';
import { checkRole } from '../middlewares/role.middleware';
import { createService, getAllServices, deleteService, getMyServices, updateService } from '../controllers/service.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Basic multer setup

// --- Define Service Routes ---

// GET /api/services/
// ✅ PUBLIC: Any user can view the list of services.
router.get('/', getAllServices);
router.get(
  '/my-listings',
  authenticateJWT,
  checkRole(['vendor']),
  getMyServices
);

// POST /api/services/
// 🔐 PROTECTED: Only authenticated users with the 'vendor' role can create a service.
router.post(
  '/', 
  authenticateJWT,
  checkRole(['vendor']),
  upload.array('images', 5), // Allow up to 5 images
  createService
);

// PUT /api/services/:id
// 🔐 PROTECTED: Only vendors can edit their own services.
router.put(
  '/:id',
  authenticateJWT,
  checkRole(['vendor']),
  upload.array('images', 5),
  updateService
);

router.delete(
  '/:id',
  authenticateJWT,
  checkRole(['vendor']),
  deleteService
);

export default router;