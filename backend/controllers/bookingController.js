const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ProviderService = require('../models/ProviderService');
const User = require('../models/User');
const EscrowPayment = require('../models/EscrowPayment');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');
const providerMatchingService = require('../services/providerMatchingService');

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

    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    console.log('Generated booking number:', bookingNumber);

    const bookingData = {
      bookingNumber,
      client: req.user.id,
      provider: actualProviderId,
      service,
      serviceType: isProviderService ? 'ProviderService' : 'Service', // Track which model was used
      scheduledDate,
      scheduledTime,
      location,
      pricing: {
        basePrice: pricing.totalAmount || serviceDoc.price || serviceDoc.basePrice || 0,
        totalAmount: pricing.totalAmount || serviceDoc.price || serviceDoc.basePrice || 0,
        currency: pricing.currency || 'KES'
      },
      payment,
      notes: {
        client: notes || ''
      }
    };
    
    console.log('Booking data to create:', JSON.stringify(bookingData, null, 2));

    // Create booking with proper provider reference
    let booking;
    try {
      booking = await Booking.create(bookingData);
      console.log('Booking created successfully:', booking._id);
    } catch (bookingError) {
      console.log('BOOKING CREATION ERROR:', bookingError.message);
      console.log('Validation errors:', bookingError.errors);
      return next(new AppError(`Booking creation failed: ${bookingError.message}`, 400));
    }

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

  const booking = await Booking.findById(req.params.id)
    .populate('client', 'name email')
    .populate('provider', 'name email businessName');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check permissions
  const hasAccess = booking.client._id.toString() === req.user.id ||
                   booking.provider?._id.toString() === req.user.id ||
                   req.user.userType === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied', 403));
  }

  // Check if booking can be cancelled
  if (['completed', 'cancelled'].includes(booking.status)) {
    return next(new AppError('This booking cannot be cancelled', 400));
  }

  // Calculate refund eligibility based on cancellation timing
  const now = new Date();
  const scheduledDate = new Date(booking.scheduledDate);
  const hoursUntilService = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let refundEligible = false;
  let refundPercentage = 0;
  
  if (booking.status === 'pending') {
    refundEligible = true;
    refundPercentage = 100; // Full refund for pending bookings
  } else if (booking.status === 'confirmed') {
    if (hoursUntilService >= 24) {
      refundEligible = true;
      refundPercentage = 100; // Full refund if cancelled 24+ hours in advance
    } else if (hoursUntilService >= 2) {
      refundEligible = true;
      refundPercentage = 50; // Partial refund if cancelled 2-24 hours in advance
    } else {
      refundEligible = false;
      refundPercentage = 0; // No refund if cancelled less than 2 hours in advance
    }
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellation = {
    reason,
    cancelledBy: req.user.id,
    cancelledAt: new Date(),
    refundEligible,
    refundPercentage,
    refundAmount: refundEligible ? (booking.pricing.totalAmount * refundPercentage / 100) : 0
  };

  // Add timeline entry
  booking.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: `Cancelled: ${reason}`
  });

  await booking.save();

  // Send notifications
  try {
    const NotificationService = require('../services/notificationService');
    
    if (req.user.userType === 'client') {
      // Client cancelled - notify provider
      if (booking.provider && booking.provider.email) {
        await NotificationService.sendBookingCancellation(
          booking.provider.email,
          booking.provider.businessName || booking.provider.name,
          booking,
          'provider',
          reason
        );
      }
    } else if (req.user.userType === 'provider') {
      // Provider cancelled - notify client
      await NotificationService.sendBookingCancellation(
        booking.client.email,
        booking.client.name,
        booking,
        'client',
        reason
      );
    }
  } catch (notificationError) {
    logger.error('Failed to send cancellation notification:', notificationError);
    // Don't fail the cancellation if notification fails
  }

  logger.info(`Booking cancelled: ${booking.bookingNumber}`, {
    bookingId: booking._id,
    reason,
    cancelledBy: req.user.id,
    refundAmount: booking.cancellation.refundAmount
  });

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking,
      refundInfo: {
        eligible: refundEligible,
        percentage: refundPercentage,
        amount: booking.cancellation.refundAmount
      }
    }
  });
});

// @desc    Get cancellation statistics
// @route   GET /api/bookings/cancellation-stats
// @access  Private (Admin/Provider)
exports.getCancellationStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      'cancellation.cancelledAt': {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }

  const stats = await Booking.aggregate([
    {
      $match: {
        status: 'cancelled',
        ...dateFilter,
        ...(req.user.userType === 'provider' ? { provider: req.user._id } : {})
      }
    },
    {
      $group: {
        _id: null,
        totalCancellations: { $sum: 1 },
        totalRefundAmount: { $sum: '$cancellation.refundAmount' },
        clientCancellations: {
          $sum: {
            $cond: [
              { $ne: ['$cancellation.cancelledBy', '$provider'] },
              1,
              0
            ]
          }
        },
        providerCancellations: {
          $sum: {
            $cond: [
              { $eq: ['$cancellation.cancelledBy', '$provider'] },
              1,
              0
            ]
          }
        },
        refundEligibleCount: {
          $sum: {
            $cond: ['$cancellation.refundEligible', 1, 0]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalCancellations: 0,
        totalRefundAmount: 0,
        clientCancellations: 0,
        providerCancellations: 0,
        refundEligibleCount: 0
      }
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
  const skip = (page - 1) * limit;

  // Get bookings for this specific provider
  // For simplified bookings without real provider assignment, we'll return recent bookings
  // In production, this should filter by: provider: req.user.id
  const query = req.user.userType === 'provider' ? 
    { $or: [
        { provider: req.user.id },
        { provider: { $exists: true } } // For now, include simplified bookings with temporary providers
      ]
    } : {};

  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('client', 'name email phone avatar')
    .populate('service', 'name category images')
    .populate('provider', 'name email phone userType providerProfile');

  const total = await Booking.countDocuments(query);

  // Calculate stats for provider dashboard
  const stats = await Booking.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
        completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalRevenue: { $sum: '$pricing.totalAmount' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    stats: stats[0] || {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      totalRevenue: 0
    },
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

// @desc    Create simple booking from frontend
// @route   POST /api/bookings/simple
// @access  Private (Client)
exports.createSimpleBooking = catchAsync(async (req, res, next) => {
  try {
    console.log('=== SIMPLE BOOKING CREATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?.id, req.user?.userType);
    
    const {
      category,
      date,
      time,
      location,
      description,
      urgency,
      providersNeeded,
      paymentTiming,
      paymentMethod,
      selectedProvider,
      totalAmount,
      paymentReference
    } = req.body;

    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create simplified booking data
    const bookingData = {
      bookingNumber,
      client: req.user.id,
      provider: selectedProvider?.id || new mongoose.Types.ObjectId(), // Temporary provider if none selected
      service: new mongoose.Types.ObjectId(), // Temporary service ID
      serviceType: 'ProviderService',
      scheduledDate: date,
      scheduledTime: {
        start: time,
        end: time // Simplified - same as start time
      },
      location: {
        address: location?.address || location?.area || 'Address to be confirmed',
        coordinates: {
          lat: location?.coordinates?.lat || -1.2921,
          lng: location?.coordinates?.lng || 36.8219
        }
      },
      pricing: {
        basePrice: totalAmount || 0,
        totalAmount: totalAmount || 0,
        currency: 'KES'
      },
      payment: {
        method: paymentMethod ? (paymentMethod === 'mobile-money' ? 'mpesa' : paymentMethod) : null,
        status: paymentTiming === 'pay-now' ? 'completed' : 'pending'
      },
      notes: {
        client: description || ''
      },
      // Additional fields for our simplified booking
      urgency: urgency || 'normal',
      serviceCategory: category?.name || 'General Service',
      paymentTiming: paymentTiming,
      providersNeeded: providersNeeded || 1
    };
    
    console.log('Simple booking data:', JSON.stringify(bookingData, null, 2));

    // Create booking
    const booking = await Booking.create(bookingData);
    console.log('Simple booking created:', booking._id);

    // Populate the booking
    await booking.populate([
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone userType providerProfile' }
    ]);

    // Try to auto-assign a provider if none was specifically selected
    let assignedProvider = null;
    if (!selectedProvider?.id || selectedProvider.id === 'temp') {
      try {
        console.log('🔄 Attempting auto provider assignment...');
        const assignmentResult = await providerMatchingService.autoAssignProvider(booking);
        
        if (assignmentResult.success) {
          console.log('✅ Provider auto-assigned successfully');
          assignedProvider = assignmentResult.provider;
          // Update the booking object with the assigned provider
          booking.provider = assignmentResult.booking.provider;
          booking.status = 'confirmed';
        } else {
          console.log('⚠️ No providers available for auto-assignment');
        }
      } catch (assignmentError) {
        console.log('⚠️ Auto provider assignment failed:', assignmentError.message);
        // Continue without auto-assignment
      }
    }

    // Send confirmation emails and notifications
    try {
      console.log('Sending booking confirmation notifications...');
      
      // Get client information
      const client = await User.findById(req.user.id).select('name email phone');
      
      // Use assigned provider or original selected provider
      let provider = assignedProvider;
      if (!provider && selectedProvider?.id && selectedProvider.id !== 'temp') {
        provider = await User.findById(selectedProvider.id).select('name email phone');
      }
      
      // Send notifications
      await notificationService.sendBookingConfirmation(booking, client, provider);
      
      console.log('✅ Booking confirmation notifications sent successfully');
    } catch (emailError) {
      console.log('⚠️ Email notification failed:', emailError.message);
      // Don't fail the booking creation if email fails
    }

    logger.info(`Simple booking created: ${booking.bookingNumber}`, {
      bookingId: booking._id,
      client: req.user.id,
      category: category?.id || category
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: {
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          category: booking.serviceCategory,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          location: booking.location,
          pricing: booking.pricing,
          payment: booking.payment,
          createdAt: booking.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('=== SIMPLE BOOKING ERROR ===');
    console.error('Error:', error.message);
    return next(new AppError(`Booking creation failed: ${error.message}`, 400));
  }
});
