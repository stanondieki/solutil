const express = require('express');
const { body, query } = require('express-validator');
const ProviderServiceManager = require('../utils/providerServiceManager');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// @desc    Get all active services for booking
// @route   GET /api/v2/services
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('lat').optional().isFloat().withMessage('Latitude must be a number'),
  query('lng').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km'),
  validate
], catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // Build filters
  const filters = { limit };
  
  if (req.query.category) {
    filters.category = req.query.category;
  }
  
  if (req.query.minPrice || req.query.maxPrice) {
    filters.priceRange = {
      min: req.query.minPrice ? parseFloat(req.query.minPrice) : 0,
      max: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined
    };
  }
  
  if (req.query.lat && req.query.lng) {
    filters.location = {
      coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)],
      radius: req.query.radius ? parseFloat(req.query.radius) : 25
    };
  }

  const services = await ProviderServiceManager.getServicesForBooking(filters);

  // Paginate results
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedServices = services.slice(startIndex, endIndex);

  res.status(200).json({
    status: 'success',
    results: paginatedServices.length,
    totalResults: services.length,
    pagination: {
      page,
      pages: Math.ceil(services.length / limit),
      total: services.length,
      limit
    },
    data: {
      services: paginatedServices.map(service => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        subCategory: service.subCategory,
        pricing: service.pricing,
        rating: service.rating,
        images: service.images,
        provider: {
          _id: service.providerId._id,
          businessName: service.providerId.businessName,
          rating: service.providerId.rating,
          location: service.providerId.location,
          profilePicture: service.providerId.profilePicture
        },
        availability: service.availability,
        serviceArea: service.serviceArea
      }))
    }
  });
}));

// @desc    Get single service by ID
// @route   GET /api/v2/services/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res, next) => {
  const service = await ProviderService.findById(req.params.id)
    .populate('providerId', 'businessName email phone rating location profilePicture createdAt');

  if (!service || !service.isActive) {
    return next(new AppError('Service not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service: {
        _id: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        subCategory: service.subCategory,
        pricing: service.pricing,
        rating: service.rating,
        images: service.images,
        requirements: service.requirements,
        availability: service.availability,
        serviceArea: service.serviceArea,
        provider: service.providerId,
        createdAt: service.createdAt,
        reviews: service.reviews || []
      }
    }
  });
}));

// @desc    Search services
// @route   GET /api/v2/services/search
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('category').optional().isString(),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat({ min: 1, max: 100 }),
  validate
], catchAsync(async (req, res, next) => {
  const { q: searchQuery } = req.query;
  
  // Build search filters
  const filters = {
    limit: 50,
    search: searchQuery
  };

  if (req.query.category) filters.category = req.query.category;
  
  if (req.query.lat && req.query.lng) {
    filters.location = {
      coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)],
      radius: req.query.radius ? parseFloat(req.query.radius) : 25
    };
  }

  // For search, we'll do a simple text match on title and description
  const ProviderService = require('../models/ProviderService');
  
  const query = {
    isActive: true,
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { category: { $regex: searchQuery, $options: 'i' } }
    ]
  };

  if (filters.category) {
    query.category = filters.category;
  }

  const services = await ProviderService.find(query)
    .populate('providerId', 'businessName email rating location profilePicture')
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services: services.map(service => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        pricing: service.pricing,
        rating: service.rating,
        images: service.images,
        provider: service.providerId
      }))
    }
  });
}));

// Protected Routes (Providers only)
router.use(protect);

// @desc    Get provider's own services
// @route   GET /api/v2/services/my-services
// @access  Private (Provider)
router.get('/my-services', restrictTo('provider'), catchAsync(async (req, res, next) => {
  const services = await ProviderServiceManager.getProviderServices(req.user.id);

  // Calculate stats (compatible with legacy API)
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

// @desc    Update service
// @route   PUT /api/v2/services/:id
// @access  Private (Provider - own services only)
router.put('/:id', restrictTo('provider'), [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 500 }),
  body('category').optional().isString(),
  body('pricing.basePrice').optional().isFloat({ min: 0 }),
  validate
], catchAsync(async (req, res, next) => {
  const ProviderService = require('../models/ProviderService');
  
  const service = await ProviderService.findOne({
    _id: req.params.id,
    providerId: req.user.id
  });

  if (!service) {
    return next(new AppError('Service not found or access denied', 404));
  }

  const updatedService = await ProviderService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Service updated successfully',
    data: {
      service: updatedService
    }
  });
}));

// @desc    Deactivate service
// @route   DELETE /api/v2/services/:id
// @access  Private (Provider - own services only)
router.delete('/:id', restrictTo('provider'), catchAsync(async (req, res, next) => {
  const deactivatedService = await ProviderServiceManager.deactivateService(
    req.params.id,
    req.user.id
  );

  if (!deactivatedService) {
    return next(new AppError('Service not found or access denied', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Service deactivated successfully',
    data: {
      service: deactivatedService
    }
  });
}));

module.exports = router;