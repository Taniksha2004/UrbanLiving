import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { checkRole } from '../middlewares/role.middleware';
import {
  createBill,
  getMyBills,
  getBillsCreatedByMe,
  getBillById,
  updateBill,
  deleteBill,
  settleBill,
} from '../controllers/bill.controller';

const router = Router();

// All bill routes require authentication (available to all user types)
const ALL_USERS = ['student', 'property-owner', 'vendor'];

// ✅ Get all bills for the current user
router.get('/', authenticateJWT, checkRole(ALL_USERS), getMyBills);

// ✅ Get bills created by the current user
router.get('/created', authenticateJWT, checkRole(ALL_USERS), getBillsCreatedByMe);

// ✅ Create a new bill
router.post('/', authenticateJWT, checkRole(ALL_USERS), createBill);

// ✅ Get a single bill by ID
router.get('/:billId', authenticateJWT, checkRole(ALL_USERS), getBillById);

// ✅ Update a bill
router.put('/:billId', authenticateJWT, checkRole(ALL_USERS), updateBill);

// ✅ Delete a bill
router.delete('/:billId', authenticateJWT, checkRole(ALL_USERS), deleteBill);

// ✅ Mark bill as settled
router.patch('/:billId/settle', authenticateJWT, checkRole(ALL_USERS), settleBill);

export default router;
