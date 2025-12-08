const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Client only)
exports.createReview = catchAsync(async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  // Validate inputs
  if (!bookingId || !rating || !comment) {
    return next(new AppError('Booking ID, rating, and comment are required', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  // Get the booking
  const booking = await Booking.findById(bookingId)
    .populate('service')
    .populate('provider');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user is the client who made the booking
  if (booking.client.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only review your own bookings', 403));
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(new AppError('You can only review completed bookings', 400));
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    booking: bookingId,
    reviewer: req.user._id
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this booking', 400));
  }

  // Create the review
  const review = await Review.create({
    booking: bookingId,
    service: booking.service._id,
    reviewer: req.user._id,
    provider: booking.provider._id,
    rating,
    comment: comment.trim(),
    isVerified: true // Since it's linked to a completed booking
  });

  // Update booking with review
  booking.rating = rating;
  booking.review = review._id;  // Store the review document ID, not the comment
  await booking.save();

  // Update service average rating
  await updateServiceRating(booking.service._id);

  // Update provider average rating
  await updateProviderRating(booking.provider._id);

  // Populate the review for response
  await review.populate([
    { path: 'reviewer', select: 'name email' },
    { path: 'provider', select: 'name email' },
    { path: 'service', select: 'title category' }
  ]);

  logger.info(`Review created: ${review._id} for booking ${bookingId} by ${req.user.email}`);

  res.status(201).json({
    status: 'success',
    message: 'Review created successfully',
    data: {
      review
    }
  });
});

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
exports.getServiceReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const serviceId = req.params.serviceId;

  const reviews = await Review.find({ service: serviceId })
    .populate('reviewer', 'name')
    .populate('provider', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ service: serviceId });

  // Calculate rating distribution
  const ratingStats = await Review.aggregate([
    { $match: { service: mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const averageRating = await Review.aggregate([
    { $match: { service: mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: averageRating[0]?.averageRating || 0,
        totalReviews: averageRating[0]?.totalReviews || 0,
        ratingDistribution: ratingStats
      }
    }
  });
});

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const providerId = req.params.providerId;

  const reviews = await Review.find({ provider: providerId })
    .populate('reviewer', 'name')
    .populate('service', 'title category')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ provider: providerId });

  const averageRating = await Review.aggregate([
    { $match: { provider: mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: averageRating[0]?.averageRating || 0,
        totalReviews: averageRating[0]?.totalReviews || 0
      }
    }
  });
});

// @desc    Get reviews for the current user (provider reviews or client reviews)
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = catchAsync(async (req, res, next) => {
  let reviews;
  
  // If user is a provider, get reviews about their services
  if (req.user.userType === 'provider') {
    reviews = await Review.find({ provider: req.user._id })
      .populate('reviewer', 'name email')
      .populate('service', 'title category')
      .populate('booking', 'scheduledDate totalAmount')
      .sort({ createdAt: -1 });
  } else {
    // If user is a client, get reviews they have made
    reviews = await Review.find({ reviewer: req.user._id })
      .populate('service', 'title category')
      .populate('provider', 'name email')
      .populate('booking', 'scheduledDate totalAmount')
      .sort({ createdAt: -1 });
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// @desc    Update helpful votes for a review
// @route   PATCH /api/reviews/:id/helpful
// @access  Private
exports.updateHelpfulVotes = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  review.helpfulVotes += 1;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Helper function to update service average rating
async function updateServiceRating(serviceId) {
  const stats = await Review.aggregate([
    { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  }
}

// Helper function to update provider average rating
async function updateProviderRating(providerId) {
  const stats = await Review.aggregate([
    { $match: { provider: mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(providerId, {
      'providerProfile.averageRating': Math.round(stats[0].averageRating * 10) / 10,
      'providerProfile.totalReviews': stats[0].totalReviews
    });
  }
}