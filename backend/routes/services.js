// === SERVICE ROUTES ANALYSIS ===

const express = require('express');
const { body, query } = require('express-validator');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  searchServices,
  getPopularServices,
  getServicesByCategory
} = require('../controllers/serviceController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  validate
], optionalAuth, getServices);

router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate
], searchServices);

router.get('/popular', getPopularServices);

router.get('/category/:category', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate
], getServicesByCategory);

router.get('/:id', getService);

// Protected routes
router.use(protect);

router.post('/', restrictTo('admin'), [ // Only admins can create services - providers get services from onboarding
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Service name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'gardening', 'appliance-repair', 'hvac', 'roofing', 'other'])
    .withMessage('Invalid service category'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('priceType')
    .optional()
    .isIn(['fixed', 'hourly', 'per-unit'])
    .withMessage('Price type must be fixed, hourly, or per-unit'),
  body('duration.estimated')
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive integer'),
  validate
], createService);

router.put('/:id', restrictTo('provider', 'admin'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Service name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'gardening', 'appliance-repair', 'hvac', 'roofing', 'other'])
    .withMessage('Invalid service category'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  validate
], updateService);

router.delete('/:id', restrictTo('provider', 'admin'), deleteService);

module.exports = router;
