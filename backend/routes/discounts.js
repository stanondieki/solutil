const express = require('express');
const { body, param, query } = require('express-validator');
const {
  validateDiscountCode,
  applyDiscountCode,
  getFestiveDiscounts,
  createDiscountCode,
  getAllDiscountCodes,
  updateDiscountCode,
  deleteDiscountCode,
  getDiscountStats
} = require('../controllers/discountController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Public route - get festive discounts
router.get('/festive', getFestiveDiscounts);

// Protected routes - require authentication
router.use(protect);

// Validate a discount code
router.post('/validate', [
  body('code').notEmpty().withMessage('Discount code is required'),
  body('orderAmount').optional().isNumeric().withMessage('Order amount must be a number'),
  body('categoryId').optional().isString(),
  validate
], validateDiscountCode);

// Apply a discount code
router.post('/apply', [
  body('code').notEmpty().withMessage('Discount code is required'),
  body('orderAmount').isNumeric().withMessage('Order amount is required'),
  body('categoryId').optional().isString(),
  validate
], applyDiscountCode);

// Admin routes
router.use(restrictTo('admin'));

// Get all discount codes
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('active').optional().isBoolean(),
  query('festive').optional().isBoolean(),
  validate
], getAllDiscountCodes);

// Get discount stats
router.get('/stats', getDiscountStats);

// Create discount code
router.post('/', [
  body('code').notEmpty().withMessage('Discount code is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('discountValue').isNumeric().withMessage('Discount value is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
  body('discountType').optional().isIn(['percentage', 'fixed']),
  body('minOrderAmount').optional().isNumeric(),
  body('maxDiscount').optional().isNumeric(),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('perUserLimit').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
  body('isFestive').optional().isBoolean(),
  validate
], createDiscountCode);

// Update discount code
router.patch('/:id', [
  param('id').isMongoId().withMessage('Invalid discount code ID'),
  validate
], updateDiscountCode);

// Delete discount code
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid discount code ID'),
  validate
], deleteDiscountCode);

module.exports = router;
