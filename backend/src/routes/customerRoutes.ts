import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerDetails,
  getCustomerStats
} from '../controllers/customerController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All routes are admin-only
router.use(protect, restrictTo('admin'));

router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', getCustomerDetails);

export default router;