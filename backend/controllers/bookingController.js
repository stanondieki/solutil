const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const EscrowPayment = require('../models/EscrowPayment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// @desc    Get bookings with filtering and pagination
// @route   GET /api/bookings
// @access  Private
exports.getBookings = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter based on user type
  let filters = {};
  
  if (req.user.userType === 'client') {
    filters.client = req.user.id;
  } else if (req.user.userType === 'provider') {
    // This would need to be adjusted to filter by provider ID
    // For now, just return empty result
    filters.client = req.user.id; // Temporary
  }

  if (req.query.status) {
    filters.status = req.query.status;
  }

  const bookings = await Booking.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('client', 'name email phone avatar')
    .populate('service', 'name category images basePrice')
    .populate('provider', 'businessName rating');

  const total = await Booking.countDocuments(filters);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    },
    data: {
      bookings
    }
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('client', 'name email phone avatar address')
    .populate('service', 'name category description images basePrice')
    .populate('provider', 'businessName user rating location services')
    .populate('review');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user has access to this booking
  const hasAccess = booking.client._id.toString() === req.user.id ||
                   booking.provider?.user?.toString() === req.user.id ||
                   req.user.userType === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Client)
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    provider,
    service,
    scheduledDate,
    scheduledTime,
    location,
    pricing,
    payment,
    notes
  } = req.body;

  // Verify service exists, or create a basic one if it doesn't
  let serviceDoc = await Service.findById(service);
  if (!serviceDoc) {
    console.log('Service not found, creating a basic service...');
    // Create a basic service for testing
    serviceDoc = await Service.create({
      name: 'Basic Service',
      category: 'other',
      description: 'Automatically created service for booking',
      basePrice: 2500,
      priceType: 'fixed',
      isActive: true
    });
    console.log('Created service:', serviceDoc._id);
    // Update the service ID to use the created one
    service = serviceDoc._id;
  }

  // Create booking
  const booking = await Booking.create({
    client: req.user.id,
    provider: provider || req.user.id, // Use current user as provider if none specified
    service,
    scheduledDate,
    scheduledTime,
    location,
    pricing,
    payment,
    notes: {
      client: notes
    }
  });

  // Populate the created booking
  await booking.populate([
    { path: 'client', select: 'name email phone' },
    { path: 'service', select: 'name category' },
    { path: 'provider', select: 'businessName' }
  ]);

  logger.info(`New booking created: ${booking.bookingNumber}`, {
    bookingId: booking._id,
    client: req.user.id,
    service: service
  });

  res.status(201).json({
    status: 'success',
    message: 'Booking created successfully',
    data: {
      booking
    }
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check permissions
  const hasAccess = booking.client.toString() === req.user.id ||
                   booking.provider?.toString() === req.user.id ||
                   req.user.userType === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied', 403));
  }

  // Update booking
  booking.status = status;
  if (notes) {
    if (req.user.userType === 'provider') {
      booking.notes.provider = notes;
    } else {
      booking.notes.client = notes;
    }
  }

  // Add timeline entry
  booking.timeline.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes
  });

  await booking.save();

  logger.info(`Booking status updated: ${booking.bookingNumber}`, {
    bookingId: booking._id,
    oldStatus: booking.status,
    newStatus: status,
    updatedBy: req.user.id
  });

  res.status(200).json({
    status: 'success',
    message: 'Booking status updated successfully',
    data: {
      booking
    }
  });
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check permissions
  const hasAccess = booking.client.toString() === req.user.id ||
                   booking.provider?.toString() === req.user.id ||
                   req.user.userType === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied', 403));
  }

  // Check if booking can be cancelled
  if (['completed', 'cancelled'].includes(booking.status)) {
    return next(new AppError('This booking cannot be cancelled', 400));
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellation = {
    reason,
    cancelledBy: req.user.id,
    cancelledAt: new Date(),
    refundEligible: booking.status === 'pending' // Simple logic
  };

  // Add timeline entry
  booking.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: `Cancelled: ${reason}`
  });

  await booking.save();

  logger.info(`Booking cancelled: ${booking.bookingNumber}`, {
    bookingId: booking._id,
    reason,
    cancelledBy: req.user.id
  });

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking
    }
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const bookings = await Booking.getRecentBookings(req.user.id, 'client', limit * page);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider-bookings
// @access  Private (Provider)
exports.getProviderBookings = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // This is simplified - in a real app, you'd have a Provider model
  // and link bookings to providers properly
  const bookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('client', 'name email phone avatar')
    .populate('service', 'name category images');

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// @desc    Complete booking and release escrow payment
// @route   POST /api/bookings/:id/complete
// @access  Private (Client only)
exports.completeBooking = catchAsync(async (req, res, next) => {
  const { rating, review, releasePayment } = req.body;
  const bookingId = req.params.id;

  // Get the booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user is the client who made the booking
  if (booking.client.toString() !== req.user.id) {
    return next(new AppError('You can only complete your own bookings', 403));
  }

  // Check if booking is in the right status
  if (booking.status !== 'in-progress') {
    return next(new AppError('Booking must be in progress to complete', 400));
  }

  // Find the escrow payment for this booking
  const escrowPayment = await EscrowPayment.findByBooking(bookingId);

  if (!escrowPayment) {
    return next(new AppError('No payment found for this booking', 404));
  }

  if (escrowPayment.status !== 'completed') {
    return next(new AppError('Payment is not in completed status', 400));
  }

  try {
    // Update booking status
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.rating = rating;
    booking.review = review;
    await booking.save();

    if (releasePayment) {
      // Release payment to provider
      await escrowPayment.releaseToProvider({
        releasedBy: req.user.id,
        rating,
        review,
        method: 'mpesa',
        payoutReference: `PAYOUT_${Date.now()}`
      });

      logger.info(`Payment released for booking ${bookingId}: ${escrowPayment.formattedProviderAmount}`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking completed successfully',
      data: {
        booking,
        paymentReleased: releasePayment,
        providerAmount: escrowPayment.providerAmount
      }
    });
  } catch (error) {
    logger.error('Error completing booking:', error);
    return next(new AppError('Failed to complete booking', 500));
  }
});

// @desc    Dispute booking and hold escrow payment
// @route   POST /api/bookings/:id/dispute
// @access  Private (Client only)
exports.disputeBooking = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const bookingId = req.params.id;

  // Get the booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user is the client who made the booking
  if (booking.client.toString() !== req.user.id) {
    return next(new AppError('You can only dispute your own bookings', 403));
  }

  // Check if booking can be disputed
  if (!['in-progress', 'completed'].includes(booking.status)) {
    return next(new AppError('Booking cannot be disputed in current status', 400));
  }

  // Find the escrow payment for this booking
  const escrowPayment = await EscrowPayment.findByBooking(bookingId);

  if (!escrowPayment) {
    return next(new AppError('No payment found for this booking', 404));
  }

  if (escrowPayment.status === 'released') {
    return next(new AppError('Cannot dispute - payment has already been released', 400));
  }

  try {
    // Update booking status
    booking.status = 'disputed';
    booking.disputeReason = reason;
    booking.disputedAt = new Date();
    await booking.save();

    // Update escrow payment status
    await escrowPayment.initiateDispute(reason, req.user.id);

    // TODO: Send notification to admin/support team
    // TODO: Send email notifications to client and provider

    logger.info(`Dispute initiated for booking ${bookingId}: ${reason}`);

    res.status(200).json({
      status: 'success',
      message: 'Dispute initiated successfully. Our support team will review and contact you within 24 hours.',
      data: {
        booking,
        disputeId: escrowPayment.id
      }
    });
  } catch (error) {
    logger.error('Error initiating dispute:', error);
    return next(new AppError('Failed to initiate dispute', 500));
  }
});
