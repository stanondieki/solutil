const express = require('express');
const { protect } = require('../middleware/auth');
const ProviderService = require('../models/ProviderService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get public services by category (for client discovery)
// @route   GET /api/provider-services/public/:category
// @access  Public
router.get('/public/:category', catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { limit = 20, page = 1, sort = '-rating' } = req.query;
  
  const skip = (page - 1) * limit;
  
  const services = await ProviderService.find({ 
    category: category.toLowerCase(),
    isActive: true 
  })
    .populate('providerId', 'name email phone providerProfile')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ProviderService.countDocuments({ 
    category: category.toLowerCase(),
    isActive: true 
  });

  res.status(200).json({
    success: true,
    results: services.length,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    data: {
      services
    }
  });
}));

// @desc    Get all public services (for browsing)
// @route   GET /api/provider-services/public
// @access  Public
router.get('/public', catchAsync(async (req, res, next) => {
  const { limit = 20, page = 1, sort = '-rating', category } = req.query;
  
  const skip = (page - 1) * limit;
  
  let filter = { isActive: true };
  if (category) {
    filter.category = category.toLowerCase();
  }
  
  const services = await ProviderService.find(filter)
    .populate('providerId', 'name email phone providerProfile')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ProviderService.countDocuments(filter);

  // Group services by category for better organization
  const servicesByCategory = {};
  services.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = [];
    }
    servicesByCategory[service.category].push(service);
  });

  res.status(200).json({
    success: true,
    results: services.length,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    data: {
      services,
      servicesByCategory
    }
  });
}));

// @desc    Get public service by ID (for booking)
// @route   GET /api/provider-services/public/service/:id
// @access  Public
router.get('/public/service/:id', catchAsync(async (req, res, next) => {
  const service = await ProviderService.findOne({ 
    _id: req.params.id,
    isActive: true 
  }).populate('providerId', 'name email phone providerProfile');

  if (!service) {
    return next(new AppError('Service not found or not active', 404));
  }

  logger.info(`Public service details fetched: ${service.title} (${service._id})`);

  res.status(200).json({
    success: true,
    data: {
      service
    }
  });
}));

// @desc    Get all services for provider
// @route   GET /api/services
// @access  Private (Provider only)
router.get('/', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const services = await ProviderService.find({ providerId: req.user._id })
    .sort({ createdAt: -1 });

  // Calculate stats
  const stats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.isActive).length,
    totalBookings: services.reduce((sum, s) => sum + (s.totalBookings || 0), 0),
    totalRevenue: services.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
    averageRating: services.length > 0 
      ? services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length 
      : 0
  };

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services,
      stats
    }
  });
}));

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private (Provider only)
router.get('/:id', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const service = await ProviderService.findOne({ 
    _id: req.params.id, 
    providerId: req.user._id 
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
}));

// @desc    Create new service - DISABLED - Services are created automatically during onboarding
// @route   POST /api/services
// @access  Private (Provider only)
router.post('/', protect, catchAsync(async (req, res, next) => {
  // Providers cannot create services manually - they are created automatically during onboarding
  return next(new AppError('Service creation is not allowed. Services are automatically created when your provider application is approved during the onboarding process.', 403));
}));

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
router.put('/:id', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const service = await ProviderService.findOne({ 
    _id: req.params.id, 
    providerId: req.user._id 
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  const updatedService = await ProviderService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  logger.info(`Service updated: ${updatedService.title} by provider ${req.user.email}`);

  // Send email notification if service status changed or significant updates
  try {
    const { sendServiceUpdatedEmail } = require('../utils/email');
    
    const significantChange = 
      service.isActive !== updatedService.isActive ||
      service.price !== updatedService.price ||
      service.title !== updatedService.title;

    if (significantChange) {
      const priceDisplay = updatedService.priceType === 'quote' 
        ? 'Custom Quote' 
        : updatedService.priceType === 'hourly' 
          ? `KSh ${updatedService.price}/hr`
          : `KSh ${updatedService.price}`;

      await sendServiceUpdatedEmail(req.user.email, {
        providerName: req.user.name,
        serviceTitle: updatedService.title,
        category: updatedService.category,
        priceDisplay,
        isActive: updatedService.isActive,
        serviceURL: `${process.env.CLIENT_URL || 'http://localhost:3000'}/provider/services`
      });
      
      logger.info(`Service update notification email sent to ${req.user.email}`);
    }
  } catch (emailError) {
    logger.error('Failed to send service update email:', emailError.message);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    status: 'success',
    data: {
      service: updatedService
    }
  });
}));

// @desc    Toggle service status
// @route   PATCH /api/services/:id/toggle
// @access  Private (Provider only)
router.patch('/:id/toggle', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const service = await ProviderService.findOne({ 
    _id: req.params.id, 
    providerId: req.user._id 
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  service.isActive = !service.isActive;
  await ProviderService.save();

  logger.info(`Service ${service.isActive ? 'activated' : 'deactivated'}: ${service.title}`);

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
}));

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
router.delete('/:id', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const service = await ProviderService.findOne({ 
    _id: req.params.id, 
    providerId: req.user._id 
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  await ProviderService.findByIdAndDelete(req.params.id);

  logger.info(`Service deleted: ${service.title} by provider ${req.user.email}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// Advanced routes

// @desc    Get service analytics
// @route   GET /api/services/:id/analytics
// @access  Private (Provider only)
router.get('/:id/analytics', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const service = await ProviderService.findOne({ 
    _id: req.params.id, 
    providerId: req.user._id 
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // TODO: Implement detailed analytics
  const analytics = {
    totalBookings: service.totalBookings || 0,
    totalRevenue: service.totalRevenue || 0,
    averageRating: service.rating || 0,
    conversionRate: 0, // TODO: Calculate from views vs bookings
    monthlyBookings: [], // TODO: Get booking history
    recentReviews: [] // TODO: Get recent reviews
  };

  res.status(200).json({
    status: 'success',
    data: {
      analytics
    }
  });
}));

// @desc    Duplicate service
// @route   POST /api/services/:id/duplicate
// @access  Private (Provider only)
router.post('/:id/duplicate', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return next(new AppError('Access denied. Provider privileges required.', 403));
  }

  const originalService = await ProviderService.findOne({ 
    _id: req.params.id, 
    providerId: req.user._id 
  });

  if (!originalService) {
    return next(new AppError('Service not found', 404));
  }

  const duplicatedData = originalService.toObject();
  delete duplicatedData._id;
  delete duplicatedData.createdAt;
  delete duplicatedData.updatedAt;
  delete duplicatedData.totalBookings;
  delete duplicatedData.totalRevenue;
  delete duplicatedData.rating;

  duplicatedData.title = `${duplicatedData.title} (Copy)`;
  duplicatedData.isActive = false; // Start as inactive

  const duplicatedService = await ProviderService.create(duplicatedData);

  logger.info(`Service duplicated: ${duplicatedService.title} by provider ${req.user.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      service: duplicatedService
    }
  });
}));

// @desc    Get all public provider services (for clients to discover)
// @route   GET /api/provider-services/public
// @access  Public
router.get('/public', catchAsync(async (req, res, next) => {
  const { category, location, priceMin, priceMax, page = 1, limit = 20 } = req.query;
  
  // Build filter object
  const filter = { isActive: true };
  
  if (category && category !== 'all') {
    filter.category = category;
  }
  
  if (priceMin || priceMax) {
    filter.price = {};
    if (priceMin) filter.price.$gte = parseFloat(priceMin);
    if (priceMax) filter.price.$lte = parseFloat(priceMax);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get services with provider information
  const services = await ProviderService.find(filter)
    .populate({
      path: 'providerId',
      select: 'name email providerProfile userType providerStatus',
      match: { providerStatus: 'approved' } // Only approved providers
    })
    .sort({ rating: -1, totalBookings: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Filter out services where provider is null (not approved)
  const approvedServices = services.filter(service => service.providerId);

  const total = await ProviderService.countDocuments({
    ...filter,
    providerId: { 
      $in: await require('../models/User').find({ 
        providerStatus: 'approved',
        userType: 'provider' 
      }).distinct('_id')
    }
  });

  res.status(200).json({
    status: 'success',
    results: approvedServices.length,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    },
    data: {
      services: approvedServices
    }
  });
}));

// @desc    Get provider services by category (public)
// @route   GET /api/provider-services/category/:category
// @access  Public  
router.get('/category/:category', catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const filter = { 
    isActive: true,
    category: category 
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const services = await ProviderService.find(filter)
    .populate({
      path: 'providerId',
      select: 'name email providerProfile userType providerStatus',
      match: { providerStatus: 'approved' }
    })
    .sort({ rating: -1, totalBookings: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Filter out services where provider is null
  const approvedServices = services.filter(service => service.providerId);

  const total = await ProviderService.countDocuments({
    ...filter,
    providerId: { 
      $in: await require('../models/User').find({ 
        providerStatus: 'approved',
        userType: 'provider' 
      }).distinct('_id')
    }
  });

  res.status(200).json({
    status: 'success',
    results: approvedServices.length,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    },
    data: {
      services: approvedServices
    }
  });
}));

module.exports = router;
