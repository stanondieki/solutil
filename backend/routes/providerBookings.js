const express = require('express');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ProviderService = require('../models/ProviderService');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all bookings for provider  
// @route   GET /api/provider-bookings
// @access  Private (Provider only)
router.get('/', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const { status, date, limit = 50, page = 1 } = req.query;

  // SECURITY FIX: Get provider's services first, then filter bookings by those services
  const Service = require('../models/Service');
  const ProviderService = require('../models/ProviderService');
  
  // Get all services owned by this provider from both Service and ProviderService models
  const [services, providerServices] = await Promise.all([
    Service.find({ providerId: req.user._id }).select('_id'),
    ProviderService.find({ providerId: req.user._id }).select('_id')
  ]);
  
  // Combine service IDs from both models
  const serviceIds = [
    ...services.map(s => s._id),
    ...providerServices.map(s => s._id)
  ];
  
  // Debug logging for security verification
  console.log(`🔒 Provider ${req.user.email} (${req.user._id}) accessing bookings`);
  console.log(`📋 Provider owns ${serviceIds.length} services`);
  
  // Build query - STRICT SECURITY: Only bookings for this provider's services AND provider assignment
  let query = {
    $and: [
      {
        $or: [
          { provider: req.user._id }, // Direct provider assignment
          { service: { $in: serviceIds } } // Booking uses one of provider's services
        ]
      }
    ]
  };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (date) {
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.scheduledDate = {
      $gte: selectedDate,
      $lt: nextDay
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate('client', 'name email phone')
    .populate('service', 'title category pricing')
    .sort({ scheduledDate: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  // Calculate basic stats
  const totalBookings = await Booking.countDocuments(query);
  
  // Get stats for different statuses
  const [pendingCount, confirmedCount, completedCount] = await Promise.all([
    Booking.countDocuments({ ...query, status: 'pending' }),
    Booking.countDocuments({ ...query, status: 'confirmed' }),
    Booking.countDocuments({ ...query, status: 'completed' })
  ]);

  // Calculate total revenue from completed bookings
  const completedBookings = await Booking.find({ 
    ...query, 
    status: 'completed' 
  }).select('pricing.totalAmount finalPrice');
  
  const totalRevenue = completedBookings.reduce((sum, booking) => {
    return sum + (booking.finalPrice || booking.pricing?.totalAmount || 0);
  }, 0);

  // Calculate average rating from completed bookings with ratings
  const ratedBookings = await Booking.find({ 
    ...query, 
    status: 'completed',
    rating: { $exists: true, $ne: null }
  }).select('rating');
  
  const averageRating = ratedBookings.length > 0 
    ? ratedBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0) / ratedBookings.length
    : 0;

  const stats = {
    totalBookings,
    pendingBookings: pendingCount,
    confirmedBookings: confirmedCount,
    completedBookings: completedCount,
    totalRevenue,
    averageRating: Math.round(averageRating * 10) / 10
  };

  logger.info(`Provider ${req.user.email} fetched ${bookings.length} bookings`);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: Math.ceil(totalBookings / parseInt(limit))
      }
    }
  });
}));

// @desc    Get all bookings for provider (legacy endpoint)
// @route   GET /api/provider-bookings/provider  
// @access  Private (Provider only)
router.get('/provider', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const { status, date, limit = 50, page = 1 } = req.query;

  // SECURITY FIX: Get provider's services first, then filter bookings by those services
  const Service = require('../models/Service');
  const ProviderService = require('../models/ProviderService');
  
  // Get all services owned by this provider from both Service and ProviderService models
  const [services, providerServices] = await Promise.all([
    Service.find({ providerId: req.user._id }).select('_id'),
    ProviderService.find({ providerId: req.user._id }).select('_id')
  ]);
  
  // Combine service IDs from both models
  const serviceIds = [
    ...services.map(s => s._id),
    ...providerServices.map(s => s._id)
  ];
  
  // Build query - STRICT SECURITY: Only bookings for this provider's services AND provider assignment
  let query = {
    $and: [
      {
        $or: [
          { provider: req.user._id }, // Direct provider assignment
          { service: { $in: serviceIds } } // Booking uses one of provider's services
        ]
      }
    ]
  };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (date) {
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.scheduledDate = {
      $gte: selectedDate,
      $lt: nextDay
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate('client', 'name email phone')
    .populate('service', 'title category pricing')
    .sort({ scheduledDate: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const totalBookings = await Booking.countDocuments(query);

  // Calculate stats
  const allBookings = await Booking.find({ provider: req.user._id });
  const stats = {
    totalBookings: allBookings.length,
    pendingBookings: allBookings.filter(b => b.status === 'pending').length,
    confirmedBookings: allBookings.filter(b => b.status === 'confirmed').length,
    completedBookings: allBookings.filter(b => b.status === 'completed').length,
    cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: allBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    monthlyRevenue: 0 // TODO: Calculate current month revenue
  };

  // Get today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysBookings = await Booking.find({
    provider: req.user._id,
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $in: ['confirmed', 'in_progress'] }
  })
    .populate('client', 'name phone')
    .populate('service', 'title')
    .sort({ scheduledTime: 1 });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    totalResults: totalBookings,
    page: parseInt(page),
    totalPages: Math.ceil(totalBookings / parseInt(limit)),
    data: {
      bookings,
      stats,
      todaysBookings
    }
  });
}));

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Provider only)
router.get('/:id', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const booking = await Booking.findById(req.params.id)
    .populate('client', 'name email phone')
    .populate('service', 'title category description pricing');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // SECURITY FIX: Verify booking belongs to provider through multiple checks
  let hasAccess = false;
  
  // Check 1: Direct provider assignment
  if (booking.provider && booking.provider.toString() === req.user._id.toString()) {
    hasAccess = true;
  }
  
  // Check 2: Provider owns the service
  if (!hasAccess && booking.service) {
    const Service = require('../models/Service');
    const ProviderService = require('../models/ProviderService');
    
    const [service, providerService] = await Promise.all([
      Service.findOne({ _id: booking.service._id, providerId: req.user._id }),
      ProviderService.findOne({ _id: booking.service._id, providerId: req.user._id })
    ]);
    
    if (service || providerService) {
      hasAccess = true;
    }
  }
  
  if (!hasAccess) {
    return next(new AppError('Access denied. This booking does not belong to you.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
}));

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider only)
router.patch('/:id/status', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const { status, notes } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const booking = await Booking.findById(req.params.id)
    .populate('provider', '_id');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  console.log(`🔒 Provider ${req.user.email} attempting to update booking ${req.params.id}`);
  console.log(`📋 Booking provider: ${booking.provider?._id}, Current user: ${req.user._id}`);

  // Verify booking belongs to provider (handle both simplified and complex bookings)
  let hasAccess = false;
  
  // For simplified bookings with direct provider reference
  if (booking.provider && booking.provider._id && booking.provider._id.toString() === req.user._id.toString()) {
    hasAccess = true;
  }
  
  // For complex bookings, try to populate service if needed
  if (!hasAccess && booking.service) {
    try {
      await booking.populate('service');
      if (booking.service && booking.service.providerId && booking.service.providerId.toString() === req.user._id.toString()) {
        hasAccess = true;
      }
    } catch (err) {
      // If population fails, continue with provider-only check
      console.log('Service population failed, using provider-only check');
    }
  }
  
  // SECURITY FIX: Only allow access if provider owns this booking
  // Remove the blanket access that was allowing all providers to update any booking
  
  if (!hasAccess) {
    return next(new AppError('Access denied. This booking does not belong to you.', 403));
  }

  const oldStatus = booking.status;
  booking.status = status;
  
  if (notes) {
    if (!booking.providerNotes) booking.providerNotes = [];
    booking.providerNotes.push({
      note: notes,
      timestamp: new Date(),
      type: 'status_change'
    });
  }

  // Add status change to history
  if (!booking.statusHistory) booking.statusHistory = [];
  booking.statusHistory.push({
    status: status,
    timestamp: new Date(),
    changedBy: req.user._id,
    notes: notes
  });

  await booking.save();

  // Send notifications for status changes
  try {
    const notificationService = require('../services/notificationService');
    
    // Get client information
    const clientInfo = await User.findById(booking.client).select('name email phone');
    
    // Get provider information  
    const providerInfo = await User.findById(req.user._id).select('name email phone');
    
    if (clientInfo && providerInfo) {
      await notificationService.sendBookingStatusUpdate(booking, clientInfo, providerInfo, status);
      console.log('✅ Status update notification sent');
    }
  } catch (notificationError) {
    console.log('⚠️ Failed to send status update notification:', notificationError.message);
  }

  // Update service stats if completed (only for bookings with real services)
  if (status === 'completed' && oldStatus !== 'completed' && booking.service) {
    try {
      const Service = require('../models/Service');
      await Service.findByIdAndUpdate(booking.service._id, {
        $inc: { 
          totalBookings: 1,
          totalRevenue: booking.pricing?.totalAmount || 0
        }
      });
    } catch (serviceUpdateError) {
      console.log('⚠️ Failed to update service stats:', serviceUpdateError.message);
    }
  }

  // Create payout record if booking is completed and payment was made
  if (status === 'completed' && oldStatus !== 'completed' && booking.pricing?.totalAmount > 0) {
    try {
      const payoutScheduler = require('../services/payoutScheduler');
      
      // Create payout record (will be processed in 1 hour)
      await payoutScheduler.onBookingCompleted(booking._id);
      console.log('✅ Payout scheduled for 1 hour after completion');
    } catch (payoutError) {
      console.log('⚠️ Failed to create payout record:', payoutError.message);
    }
  }

  logger.info(`Booking status updated: ${booking._id} from ${oldStatus} to ${status} by provider ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
}));

// @desc    Add provider notes to booking
// @route   POST /api/bookings/:id/notes
// @access  Private (Provider only)
router.post('/:id/notes', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const { note, type = 'general' } = req.body;

  if (!note) {
    return next(new AppError('Note content is required', 400));
  }

  const booking = await Booking.findById(req.params.id)
    .populate('service', 'providerId');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify booking belongs to provider's service
  if (booking.service.providerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. This booking does not belong to you.', 403));
  }

  if (!booking.providerNotes) booking.providerNotes = [];
  booking.providerNotes.push({
    note,
    type,
    timestamp: new Date()
  });

  await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
}));

// @desc    Get booking analytics for provider
// @route   GET /api/bookings/analytics/provider
// @access  Private (Provider only)
router.get('/analytics/provider', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const { period = '30d' } = req.query;

  // Calculate date range
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // SECURITY FIX: Get bookings directly by provider, not by services
  const bookings = await Booking.find({
    provider: req.user._id,
    createdAt: { $gte: startDate }
  });

  // Calculate analytics
  const analytics = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    averageBookingValue: 0,
    conversionRate: 0,
    popularServices: [],
    bookingTrends: []
  };

  if (analytics.completedBookings > 0) {
    analytics.averageBookingValue = analytics.totalRevenue / analytics.completedBookings;
  }

  if (analytics.totalBookings > 0) {
    analytics.conversionRate = (analytics.completedBookings / analytics.totalBookings) * 100;
  }

  // Get popular services
  const serviceBookingCounts = {};
  bookings.forEach(booking => {
    const serviceId = booking.serviceId.toString();
    serviceBookingCounts[serviceId] = (serviceBookingCounts[serviceId] || 0) + 1;
  });

  analytics.popularServices = providerServices.map(service => ({
    service: service.title,
    bookings: serviceBookingCounts[service._id.toString()] || 0
  })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

  res.status(200).json({
    status: 'success',
    data: {
      analytics
    }
  });
}));

// @desc    Reschedule booking
// @route   PATCH /api/bookings/:id/reschedule
// @access  Private (Provider only)
router.patch('/:id/reschedule', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const { scheduledDate, scheduledTime, reason } = req.body;

  if (!scheduledDate || !scheduledTime) {
    return next(new AppError('New date and time are required', 400));
  }

  const booking = await Booking.findById(req.params.id)
    .populate('service', 'providerId');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify booking belongs to provider's service
  if (booking.service.providerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. This booking does not belong to you.', 403));
  }

  const oldDate = booking.scheduledDate;
  const oldTime = booking.scheduledTime;

  booking.scheduledDate = new Date(scheduledDate);
  booking.scheduledTime = scheduledTime;

  // Add to status history
  if (!booking.statusHistory) booking.statusHistory = [];
  booking.statusHistory.push({
    status: 'rescheduled',
    timestamp: new Date(),
    changedBy: req.user._id,
    notes: `Rescheduled from ${oldDate.toDateString()} ${oldTime} to ${scheduledDate} ${scheduledTime}. Reason: ${reason || 'Not specified'}`
  });

  await booking.save();

  logger.info(`Booking rescheduled: ${booking._id} by provider ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
}));

module.exports = router;