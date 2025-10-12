const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  socialLogin,
  changePassword,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('userType')
    .optional()
    .isIn(['client', 'provider'])
    .withMessage('User type must be either client or provider'),
  validate
], register);

router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
], login);

router.post('/logout', logout);

router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  validate
], forgotPassword);

router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
], resetPassword);

router.get('/verify-email/:token', verifyEmail);

router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  validate
], resendVerification);

router.post('/refresh-token', refreshToken);

router.post('/social-login', [
  body('provider')
    .isIn(['google', 'facebook'])
    .withMessage('Provider must be either google or facebook'),
  body('token')
    .notEmpty()
    .withMessage('Social login token is required'),
  body('userData')
    .isObject()
    .withMessage('User data is required'),
  validate
], socialLogin);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/profile', getProfile);

router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  validate
], updateProfile);

router.post('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validate
], changePassword);

// Temporary test email endpoint for production debugging
router.post('/test-email', async (req, res) => {
  try {
    const { sendWelcomeEmail } = require('../utils/email');
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }
    
    console.log('🧪 Testing production email to:', email);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      USE_REAL_SMTP: process.env.USE_REAL_SMTP,
      CLIENT_URL: process.env.CLIENT_URL,
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
    
    const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/test-token-${Date.now()}`;
    
    await sendWelcomeEmail(email, 'Production Test User', verificationURL);
    
    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully! Check your inbox and spam folder.',
      data: {
        email,
        verificationURL,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Production email test failed:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = router;
