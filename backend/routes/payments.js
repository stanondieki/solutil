const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// All routes require authentication except webhook
router.use('/webhook', paymentController.handleWebhook);

router.use(protect);

// Initialize payment
router.post('/initialize', [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  validate
], paymentController.initializePayment);

// Verify payment
router.get('/verify/:reference', paymentController.verifyPayment);

// Get payment status for a booking
router.get('/status/:bookingId', paymentController.getPaymentStatus);

module.exports = router;
