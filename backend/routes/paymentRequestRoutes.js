const express = require('express');
const paymentRequestController = require('../controllers/paymentRequestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Provider initiates payment request after completing service
router.post('/:bookingId/request-payment', paymentRequestController.initiatePaymentRequest);

// Get payment request status
router.get('/:bookingId/payment-status', paymentRequestController.getPaymentRequestStatus);

// Public webhook route (no auth required for Paystack callbacks)
router.post('/verify-payment', paymentRequestController.verifyPaymentRequest);

module.exports = router;