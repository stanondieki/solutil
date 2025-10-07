const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ProviderService = require('../models/ProviderService');
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
    .populate('provider', 'name email phone userType providerProfile');

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
    .populate('provider', 'name email phone userType providerProfile location')
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
  try {
    console.log('=== BOOKING CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?.id, req.user?.userType);
    
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

    console.log('Extracted fields:', {
      provider,
      service,
      scheduledDate,
      scheduledTime,
      location,
      pricing,
      payment,
      notes
    });

    // 🆕 UPDATED: Look for service in ProviderService collection first
    console.log('Looking for service ID:', service);
    let serviceDoc = await ProviderService.findById(service);
    let isProviderService = true;
    
    if (!serviceDoc) {
      console.log('Service not found in ProviderService, checking Service collection...');
      // Fallback to Service collection for backwards compatibility
      serviceDoc = await Service.findById(service);
      isProviderService = false;
    }
    
    console.log('Service found:', serviceDoc ? 'Yes' : 'No');
    console.log('Is ProviderService:', isProviderService);
    
    if (!serviceDoc) {
      console.log('ERROR: Service not found in either collection');
      return next(new AppError('Service not found', 404));
    }

    // Ensure service is active
    if (!serviceDoc.isActive) {
      console.log('ERROR: Service is not active');
      return next(new AppError('Service is not available for booking', 400));
    }

    // Get the actual provider ID from the service
    const actualProviderId = isProviderService ? serviceDoc.providerId : provider;
    console.log('Actual provider ID:', actualProviderId);

    const bookingData = {
      client: req.user.id,
      provider: actualProviderId,
      service,
      serviceType: isProviderService ? 'ProviderService' : 'Service', // Track which model was used
      scheduledDate,
      scheduledTime,
      location,
      pricing: {
        ...pricing,
        // Use service pricing as fallback (ProviderService uses 'price', Service uses 'basePrice')
        totalAmount: pricing.totalAmount || serviceDoc.price || serviceDoc.basePrice || 0,
        currency: pricing.currency || 'KES'
      },
      payment,
      notes: {
        client: notes
      }
    };
    
    console.log('Booking data to create:', JSON.stringify(bookingData, null, 2));

    // Create booking with proper provider reference
    const booking = await Booking.create(bookingData);
    
    console.log('Booking created successfully:', booking._id);

  // Populate the created booking with correct service model
  const populateOptions = [
    { path: 'client', select: 'name email phone' },
    { path: 'provider', select: 'name email phone userType providerProfile' }
  ];
  
  // Populate service based on type
  if (isProviderService) {
    // Use ProviderService model (different field names)
    populateOptions.push({ 
      path: 'service', 
      select: 'title category price priceType',
      model: 'ProviderService'
    });
  } else {
    // Use Service model (legacy)
    populateOptions.push({ 
      path: 'service', 
      select: 'name category basePrice',
      model: 'Service'
    });
  }
  
  await booking.populate(populateOptions);

  // Send booking confirmation emails
  try {
    const { sendBookingConfirmationEmail } = require('../utils/email');
    
    // Send confirmation to client
    if (req.user.email) {
      await sendBookingConfirmationEmail(req.user.email, {
        customerName: req.user.name,
        bookingNumber: booking.bookingNumber,
        serviceName: booking.service.name,
        providerName: booking.provider?.businessName || 'Provider',
        scheduledDate: new Date(booking.scheduledDate).toLocaleDateString(),
        scheduledTime: `${booking.scheduledTime.start} - ${booking.scheduledTime.end}`,
        totalAmount: booking.pricing?.total || 0,
        location: booking.location?.address || 'Location TBD',
        bookingURL: `${process.env.CLIENT_URL || 'http://localhost:3000'}/bookings/${booking._id}`
      });
    }

    // Send notification to provider
    if (booking.provider) {
      const providerUser = await User.findById(booking.provider);
      if (providerUser && providerUser.email) {
        await sendBookingConfirmationEmail(providerUser.email, {
          customerName: providerUser.name,
          bookingNumber: booking.bookingNumber,
          serviceName: booking.service.name,
          providerName: booking.provider?.businessName || 'Your Business',
          scheduledDate: new Date(booking.scheduledDate).toLocaleDateString(),
          scheduledTime: `${booking.scheduledTime.start} - ${booking.scheduledTime.end}`,
          totalAmount: booking.pricing?.total || 0,
          location: booking.location?.address || 'Location TBD',
          bookingURL: `${process.env.CLIENT_URL || 'http://localhost:3000'}/provider/bookings`,
          isProvider: true
        });
      }
    }

    logger.info(`Booking confirmation emails sent for booking: ${booking.bookingNumber}`);
  } catch (emailError) {
    logger.error('Failed to send booking confirmation emails:', emailError.message);
    // Don't fail the request if email fails
  }

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
  
  } catch (error) {
    console.error('=== BOOKING CREATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Re-throw the error to be handled by the error middleware
    throw error;
  }
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

  // Send email notifications for status updates
  try {
    const { sendBookingStatusUpdateEmail } = require('../utils/email');
    
    // Populate necessary fields for email
    await booking.populate([
      { path: 'client', select: 'name email' },
      { path: 'provider', select: 'businessName user' },
      { path: 'service', select: 'name' }
    ]);

    // Send email to client
    if (booking.client && booking.client.email) {
      await sendBookingStatusUpdateEmail(booking.client.email, {
        customerName: booking.client.name,
        bookingNumber: booking.bookingNumber,
        serviceName: booking.service.name,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        providerName: booking.provider?.businessName || 'Provider',
        notes: notes || '',
        bookingURL: `${process.env.CLIENT_URL || 'http://localhost:3000'}/bookings/${booking._id}`
      });
    }

    // Send email to provider if different from the user making the update
    if (booking.provider && booking.provider.user && 
        booking.provider.user.toString() !== req.user.id) {
      const providerUser = await User.findById(booking.provider.user);
      if (providerUser && providerUser.email) {
        await sendBookingStatusUpdateEmail(providerUser.email, {
          customerName: providerUser.name,
          bookingNumber: booking.bookingNumber,
          serviceName: booking.service.name,
          status: status.charAt(0).toUpperCase() + status.slice(1),
          providerName: booking.provider.businessName,
          notes: notes || '',
          bookingURL: `${process.env.CLIENT_URL || 'http://localhost:3000'}/provider/bookings`
        });
      }
    }

    logger.info(`Booking status update emails sent for booking: ${booking.bookingNumber}`);
  } catch (emailError) {
    logger.error('Failed to send booking status update emails:', emailError.message);
    // Don't fail the request if email fails
  }

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
