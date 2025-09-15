const express = require('express');
const { body, query } = require('express-validator');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
  getProviderBookings,
  completeBooking,
  disputeBooking
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// General booking routes
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed']).withMessage('Invalid status'),
  validate
], getBookings);

router.get('/my-bookings', getUserBookings);

router.get('/provider-bookings', restrictTo('provider'), getProviderBookings);

router.get('/:id', getBooking);

router.post('/', [
  body('provider')
    .isMongoId()
    .withMessage('Valid provider ID is required'),
  body('service')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('scheduledTime.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('scheduledTime.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('location.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('pricing.totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('payment.method')
    .isIn(['card', 'mpesa', 'cash', 'bank-transfer'])
    .withMessage('Invalid payment method'),
  validate
], createBooking);

router.put('/:id/status', [
  body('status')
    .isIn(['confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid booking status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate
], updateBookingStatus);

router.delete('/:id', [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Cancellation reason must be between 5 and 200 characters'),
  validate
], cancelBooking);

// Complete booking and release escrow payment
router.post('/:id/complete', [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
  body('releasePayment')
    .isBoolean()
    .withMessage('Release payment must be a boolean'),
  validate
], completeBooking);

// Dispute booking and hold escrow payment
router.post('/:id/dispute', [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Dispute reason must be between 10 and 1000 characters'),
  validate
], disputeBooking);

module.exports = router;
