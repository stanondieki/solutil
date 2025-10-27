const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Protect routes - authentication required
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    // Verify token with fallback for JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
    const decoded = jwt.verify(token, jwtSecret);

    let user;
    
    // Handle admin authentication separately
    if (decoded.userId === 'admin' && decoded.isAdmin) {
      user = {
        _id: 'admin',
        email: decoded.email,
        name: decoded.name,
        isAdmin: true,
        isActive: true,
        userType: 'admin'
      };
    } else {
      // Check if database is connected
      if (global.isDbConnected && global.isDbConnected()) {
        // Database is connected - use normal Mongoose queries
        user = await User.findById(decoded.userId);
      } else {
        // Database not connected - use mock data
        const mockDataService = require('../utils/mockDataService');
        user = await mockDataService.findUserById(decoded.userId);
      }

      if (!user) {
        return next(new AppError('User belonging to this token no longer exists.', 401));
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    return next(new AppError('Token verification failed.', 401));
  }
});

// Restrict access to specific user types
exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }
    next();
  };
};

// Optional authentication - sets user if token is valid but doesn't require it
exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }

  next();
});

// Check if user owns the resource or is admin
exports.checkOwnership = (Model, param = 'id') => {
  return catchAsync(async (req, res, next) => {
    const resource = await Model.findById(req.params[param]);
    
    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    // Admin can access anything
    if (req.user.userType === 'admin') {
      req.resource = resource;
      return next();
    }

    // Check if user owns the resource
    const isOwner = resource.user?.toString() === req.user.id || 
                   resource.client?.toString() === req.user.id ||
                   resource._id.toString() === req.user.id;

    if (!isOwner) {
      return next(new AppError('Access denied. You can only access your own resources.', 403));
    }

    req.resource = resource;
    next();
  });
};

// Verify email before certain actions
exports.requireVerifiedEmail = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Please verify your email address before proceeding.', 403));
  }
  next();
};

// Rate limiting for specific actions
exports.actionRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.user.id}_${req.route.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old attempts
    for (const [attemptKey, timestamps] of attempts.entries()) {
      attempts.set(attemptKey, timestamps.filter(time => time > windowStart));
      if (attempts.get(attemptKey).length === 0) {
        attempts.delete(attemptKey);
      }
    }

    // Check current attempts
    const userAttempts = attempts.get(key) || [];
    
    if (userAttempts.length >= maxAttempts) {
      return next(new AppError('Too many attempts. Please try again later.', 429));
    }

    // Record this attempt
    userAttempts.push(now);
    attempts.set(key, userAttempts);

    next();
  };
};
