const express = require('express');
const paymentLinkController = require('../controllers/paymentLinkController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.post('/generate/:bookingId', protect, paymentLinkController.generatePaymentLink);
router.get('/status/:bookingId', protect, paymentLinkController.getPaymentLinkStatus);

// Public routes (no authentication required)
router.get('/validate/:token', paymentLinkController.validatePaymentLink);
router.post('/process/:token', paymentLinkController.processLinkPayment);

module.exports = router;