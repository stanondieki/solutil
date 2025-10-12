const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const AlternativeVerificationService = require('../services/alternativeVerificationService');
const EmailDeliveryService = require('../services/emailDeliveryService');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// Protect all routes - admin only
router.use(protect);
router.use(restrictTo('admin'));

// @desc    Manually verify a user's email
// @route   POST /api/admin/verify-user
// @access  Admin only
router.post('/verify-user', catchAsync(async (req, res, next) => {
  const { email, reason } = req.body;
  const adminId = req.user._id;

  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email address is required'
    });
  }

  try {
    const result = await AlternativeVerificationService.manuallyVerifyUser(
      email,
      adminId.toString(),
      reason || 'Manual verification by admin'
    );

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        email: email,
        verificationMethod: result.verificationMethod,
        verifiedBy: req.user.name,
        timestamp: new Date()
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}));

// @desc    Get email delivery statistics
// @route   GET /api/admin/email-delivery-stats
// @access  Admin only
router.get('/email-delivery-stats', catchAsync(async (req, res, next) => {
  const timeRange = parseInt(req.query.hours) || 24;
  
  const stats = await EmailDeliveryService.getDeliveryStats(timeRange);
  const verificationStats = await AlternativeVerificationService.getVerificationStats();

  res.status(200).json({
    status: 'success',
    data: {
      emailDelivery: stats,
      userVerification: verificationStats,
      generatedAt: new Date()
    }
  });
}));

// @desc    Get delivery status for specific email
// @route   GET /api/admin/email-delivery-status/:email
// @access  Admin only
router.get('/email-delivery-status/:email', catchAsync(async (req, res, next) => {
  const { email } = req.params;
  const { type } = req.query;

  const deliveryStatus = await EmailDeliveryService.checkDeliveryStatus(email, type);

  res.status(200).json({
    status: 'success',
    data: {
      email: email,
      deliveryStatus: deliveryStatus,
      checkedAt: new Date()
    }
  });
}));

// @desc    Resend verification email (admin override)
// @route   POST /api/admin/resend-verification
// @access  Admin only
router.post('/resend-verification', catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const User = require('../models/User');

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  try {
    const verificationResult = await AlternativeVerificationService.sendVerificationWithFallbacks(
      user,
      {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        adminOverride: true,
        adminId: req.user._id
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Verification email resent with enhanced delivery tracking',
      data: {
        email: email,
        deliveryResult: verificationResult,
        resentBy: req.user.name,
        timestamp: new Date()
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
}));

module.exports = router;