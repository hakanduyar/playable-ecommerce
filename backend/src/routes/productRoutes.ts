import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  bulkUpdateProducts,
  deleteProduct,
  addReview,
  getProductStats
} from '../controllers/productController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').trim().notEmpty().withMessage('SKU is required')
];

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
];

const bulkUpdateValidation = [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
];

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected routes (Customer)
router.post('/:id/reviews', protect, validate(reviewValidation), addReview);

// Protected routes (Admin only)
router.get('/admin/stats', protect, restrictTo('admin'), getProductStats);
router.post('/', protect, restrictTo('admin'), validate(productValidation), createProduct);
router.put('/bulk-update', protect, restrictTo('admin'), validate(bulkUpdateValidation), bulkUpdateProducts);
router.put('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;