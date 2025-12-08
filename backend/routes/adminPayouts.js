const express = require('express');
const adminPayoutController = require('../controllers/adminPayoutController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Payout management routes
router.get('/', adminPayoutController.getAllPayouts);
router.get('/stats', adminPayoutController.getPayoutStats);
router.get('/:id', adminPayoutController.getPayoutDetails);

// Payout actions
router.post('/:id/process', adminPayoutController.processPayoutManually);
router.post('/:id/cancel', adminPayoutController.cancelPayout);
router.post('/:id/retry', adminPayoutController.retryPayout);

// Bulk operations
router.post('/bulk-action', adminPayoutController.bulkAction);

// System settings
router.put('/settings', adminPayoutController.updatePayoutSettings);

module.exports = router;