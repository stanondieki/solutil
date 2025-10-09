const express = require('express');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
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

  // Build query - use provider field directly since it references the User
  let query = { provider: req.user._id };

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
    .populate('userId', 'firstName lastName email phone')
    .populate('serviceId', 'title category pricing')
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

  // Get provider's services first
  const providerServices = await Service.find({ providerId: req.user._id }).select('_id');
  const serviceIds = providerServices.map(service => service._id);

  // Build query
  let query = { serviceId: { $in: serviceIds } };

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
    .populate('userId', 'firstName lastName email phone')
    .populate('serviceId', 'title category pricing')
    .sort({ scheduledDate: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const totalBookings = await Booking.countDocuments(query);

  // Calculate stats
  const allBookings = await Booking.find({ serviceId: { $in: serviceIds } });
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
    serviceId: { $in: serviceIds },
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $in: ['confirmed', 'in_progress'] }
  })
    .populate('userId', 'firstName lastName phone')
    .populate('serviceId', 'title')
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
    .populate('userId', 'firstName lastName email phone')
    .populate('serviceId', 'title category description pricing');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify booking belongs to provider's service
  const service = await Service.findById(booking.serviceId._id);
  if (!service || service.providerId.toString() !== req.user._id.toString()) {
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

  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const booking = await Booking.findById(req.params.id)
    .populate('serviceId', 'providerId');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify booking belongs to provider's service
  if (booking.serviceId.providerId.toString() !== req.user._id.toString()) {
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

  // Update service stats if completed
  if (status === 'completed' && oldStatus !== 'completed') {
    await Service.findByIdAndUpdate(booking.serviceId._id, {
      $inc: { 
        totalBookings: 1,
        totalRevenue: booking.totalAmount || 0
      }
    });
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
    .populate('serviceId', 'providerId');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify booking belongs to provider's service
  if (booking.serviceId.providerId.toString() !== req.user._id.toString()) {
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

  // Get provider's services
  const providerServices = await Service.find({ providerId: req.user._id }).select('_id title');
  const serviceIds = providerServices.map(service => service._id);

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

  const bookings = await Booking.find({
    serviceId: { $in: serviceIds },
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
    .populate('serviceId', 'providerId');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify booking belongs to provider's service
  if (booking.serviceId.providerId.toString() !== req.user._id.toString()) {
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