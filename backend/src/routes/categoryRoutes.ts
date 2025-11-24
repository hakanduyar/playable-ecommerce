import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation rules
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('image').optional().trim().isURL().withMessage('Image must be a valid URL')
];

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post('/', protect, restrictTo('admin'), validate(categoryValidation), createCategory);
router.put('/:id', protect, restrictTo('admin'), validate(categoryValidation), updateCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);

export default router;