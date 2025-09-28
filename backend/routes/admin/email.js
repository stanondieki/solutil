const express = require('express');
const { protect } = require('../../middleware/auth');
const { sendTestEmail, testSMTPConnection } = require('../../utils/email');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const logger = require('../../utils/logger');

const router = express.Router();

// @desc    Test SMTP connection
// @route   GET /api/admin/email/test-connection
// @access  Private (Admin only)
router.get('/test-connection', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const isConnected = await testSMTPConnection();
  
  res.status(200).json({
    status: 'success',
    data: {
      connected: isConnected,
      provider: process.env.SMTP_PROVIDER || 'custom',
      user: process.env.SMTP_USER || 'not configured',
      useRealSMTP: process.env.USE_REAL_SMTP === 'true'
    }
  });
}));

// @desc    Send test email
// @route   POST /api/admin/email/send-test
// @access  Private (Admin only)
router.post('/send-test', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Email address is required', 400));
  }

  try {
    const result = await sendTestEmail(email);
    
    logger.info(`Test email sent to ${email} by admin ${req.user.email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully',
      data: {
        messageId: result.messageId,
        to: email,
        provider: process.env.SMTP_PROVIDER || 'custom'
      }
    });
  } catch (error) {
    logger.error(`Failed to send test email to ${email}:`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message,
      troubleshooting: {
        checkCredentials: 'Verify SMTP_USER and SMTP_PASS are correct',
        checkProvider: 'Ensure SMTP_PROVIDER matches your email service',
        checkConnection: 'Test your internet connection and firewall settings',
        enableRealSMTP: 'Set USE_REAL_SMTP=true in your .env file'
      }
    });
  }
}));

// @desc    Get email configuration info
// @route   GET /api/admin/email/config
// @access  Private (Admin only)
router.get('/config', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const config = {
    provider: process.env.SMTP_PROVIDER || 'not configured',
    user: process.env.SMTP_USER || 'not configured',
    useRealSMTP: process.env.USE_REAL_SMTP === 'true',
    host: process.env.SMTP_HOST || 'auto-detected',
    port: process.env.SMTP_PORT || 'auto-detected',
    secure: process.env.SMTP_SECURE === 'true'
  };

  res.status(200).json({
    status: 'success',
    data: {
      config,
      isConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      recommendations: {
        gmail: 'Use Gmail with App Password for best reliability',
        outlook: 'Outlook/Hotmail requires 2FA and App Password',
        yahoo: 'Yahoo requires App Password, not regular password',
        custom: 'Ensure SMTP_HOST, SMTP_PORT are correctly configured'
      }
    }
  });
}));

// @desc    Send email notification manually (for testing)
// @route   POST /api/admin/email/send-notification
// @access  Private (Admin only)
router.post('/send-notification', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const { email, template, data } = req.body;
  
  if (!email || !template) {
    return next(new AppError('Email and template are required', 400));
  }

  const { sendEmail } = require('../../utils/email');
  
  try {
    const result = await sendEmail({
      email,
      template,
      data: data || {}
    });
    
    logger.info(`Manual notification sent to ${email} using template ${template} by admin ${req.user.email}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: {
        messageId: result.messageId,
        to: email,
        template
      }
    });
  } catch (error) {
    logger.error(`Failed to send notification to ${email}:`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to send notification',
      error: error.message
    });
  }
}));

module.exports = router;