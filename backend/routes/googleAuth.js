const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Authenticate/Register user with Google
// @route   POST /api/oauth/google
// @access  Public
router.post('/google', catchAsync(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new AppError('Missing Google credential', 400));
  }

  logger.info(`🔍 Google authentication attempt with credential`);

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return next(new AppError('Invalid Google token', 400));
    }

    const { sub: googleId, email, name, picture } = payload;
    logger.info(`🔍 Google user verified: ${email}`);

    // Check if user already exists with this Google ID
    let user = await User.findOne({
      $or: [
        { 'socialLogins.google.id': googleId },
        { email: email }
      ]
    });

    if (user) {
      // User exists - update Google login info if needed
      if (!user.socialLogins?.google?.id) {
        user.socialLogins = {
          ...user.socialLogins,
          google: {
            id: googleId,
            email: email
          }
        };
        await user.save();
        logger.info(`✅ Added Google login to existing user: ${email}`);
      } else {
        logger.info(`✅ Existing Google user logged in: ${email}`);
      }
    } else {
      // Create new user with Google authentication
      user = new User({
        name,
        email,
        password: 'google-oauth-' + googleId, // placeholder password
        userType: 'client', // default to client, can be changed later
        isVerified: true, // Google accounts are pre-verified
        avatar: {
          url: picture || 'https://res.cloudinary.com/solutil/image/upload/v1/defaults/avatar.png'
        },
        socialLogins: {
          google: {
            id: googleId,
            email: email
          }
        }
      });

      await user.save();
      logger.info(`✅ New Google user created: ${email}`);
    }

    // Generate JWT token (using same structure as regular auth)
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isModified('createdAt') ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        isVerified: user.isVerified,
        providerStatus: user.providerStatus
      }
    });

  } catch (error) {
    logger.error('❌ Google authentication error:', error);
    return next(new AppError('Authentication failed', 500));
  }
}));

module.exports = router;