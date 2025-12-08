const express = require('express');
const payoutController = require('../controllers/payoutController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Provider payout account management
router.post('/setup-payout', payoutController.setupPayoutMethod);
router.post('/create-recipient', payoutController.createBankTransferRecipient);
router.post('/setup-mpesa', payoutController.setupMpesaPayout);
router.get('/banks', payoutController.getBanks);
router.post('/verify-account', payoutController.verifyAccount);
router.get('/history', payoutController.getPayoutHistory);

// Admin/System routes for initiating transfers
router.post('/transfer', restrictTo('admin', 'system'), payoutController.initiateTransfer);

module.exports = router;