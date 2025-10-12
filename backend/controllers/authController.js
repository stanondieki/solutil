const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, sendWelcomeEmail } = require('../utils/email');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mockDataService = require('../utils/mockDataService');

// Helper function to generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      message,
      token,
      data: {
        user
      }
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, userType, phone } = req.body;

  let existingUser, user, verificationToken;

  // Check if database is connected
  if (global.isDbConnected && global.isDbConnected()) {
    // Database is connected - use normal Mongoose operations
    existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    user = await User.create({
      name,
      email,
      password,
      userType: userType || 'client',
      phone
    });

    // Generate email verification token
    verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
  } else {
    // Database not connected - use mock data
    logger.warn('Using mock data for user registration (database not connected)');
    
    existingUser = await mockDataService.findUserByEmail(email);
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    user = await mockDataService.createUser({
      name,
      email,
      password,
      userType: userType || 'client',
      phone
    });

    // Generate a simple verification token for mock mode
    verificationToken = crypto.randomBytes(32).toString('hex');
  }

  // Send verification email
  try {
    const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}`;
    
    // Use the enhanced welcome email function that respects USE_REAL_SMTP
    await sendWelcomeEmail(user.email, user.name, verificationURL);

    // Send additional welcome email for providers
    if (user.userType === 'provider') {
      const providerEmailTemplates = require('../utils/providerEmailTemplates');
      const template = providerEmailTemplates.welcome;
      
      let htmlContent = template.html;
      let textContent = template.text;
      
      const completeOnboardingUrl = `${process.env.CLIENT_URL}/provider/onboarding`;
      htmlContent = htmlContent.replace(/\{\{completeOnboardingUrl\}\}/g, completeOnboardingUrl);
      textContent = textContent.replace(/\{\{completeOnboardingUrl\}\}/g, completeOnboardingUrl);
      
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: htmlContent,
        text: textContent
      });
      
      logger.info(`Provider welcome email sent to ${user.email}`);
    }

    logger.info(`Verification email sent to ${user.email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    // Don't fail registration if email fails
  }

  sendTokenResponse(user, 201, res, 'Registration successful. Please check your email to verify your account.');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  let user;

  // Check if database is connected
  if (global.isDbConnected && global.isDbConnected()) {
    // Database is connected - use normal Mongoose operations
    user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please verify your email address before logging in.',
        error: 'EMAIL_NOT_VERIFIED',
        data: {
          email: user.email,
          resendEndpoint: '/api/auth/resend-verification'
        }
      });
    }

    // Set default providerStatus for existing provider users who don't have it
    if (user.userType === 'provider' && !user.providerStatus) {
      user.providerStatus = 'pending';
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Database not connected - use mock data
    logger.warn('Using mock data for user login (database not connected)');
    
    user = await mockDataService.findUserByEmail(email);
    
    if (!user || password !== 'password123') { // Simple password check for mock mode
      return next(new AppError('Invalid email or password', 401));
    }

    // In mock mode, we'll assume users are verified and active
  }

  // Update last login
  user.lastLogin = new Date();
  
  // Only save if database is connected
  if (global.isDbConnected && global.isDbConnected()) {
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 1000),
      httpOnly: true
    })
    .json({
      status: 'success',
      message: 'Logout successful'
    });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - Solutil',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetURL
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Error sending password reset email:', error);
    return next(new AppError('Error sending email. Please try again later.', 500));
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  // Hash the token to compare with stored version
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Hash the token to compare with stored version
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  // Update user verification status
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  if (user.isVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Solutil',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationURL
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return next(new AppError('Error sending email. Please try again later.', 500));
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    sendTokenResponse(user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    return next(new AppError('Invalid token', 401));
  }
});

// @desc    Social login (Google/Facebook)
// @route   POST /api/auth/social-login
// @access  Public
exports.socialLogin = catchAsync(async (req, res, next) => {
  const { provider, token, userData } = req.body;

  // Here you would verify the social login token with the respective provider
  // For demo purposes, we'll trust the provided userData

  const { email, name, id } = userData;

  let user = await User.findOne({ email });

  if (user) {
    // User exists, update social login info
    user.socialLogins[provider] = { id, email };
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  } else {
    // Create new user
    user = await User.create({
      name,
      email,
      password: crypto.randomBytes(32).toString('hex'), // Random password
      isVerified: true, // Trust social login verification
      socialLogins: {
        [provider]: { id, email }
      }
    });
  }

  sendTokenResponse(user, 200, res, 'Social login successful');
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('providerProfile')
    .populate({
      path: 'bookings',
      options: { limit: 5, sort: { createdAt: -1 } }
    });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'phone', 'address', 'preferences'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});
