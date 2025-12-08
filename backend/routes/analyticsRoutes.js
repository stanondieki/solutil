const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Provider analytics
router.get('/provider', restrictTo('provider', 'admin'), analyticsController.getProviderAnalytics);

// Admin analytics
router.get('/admin', restrictTo('admin'), analyticsController.getAdminAnalytics);

// Booking analytics (accessible to all authenticated users)
router.get('/bookings', analyticsController.getBookingAnalytics);

module.exports = router;