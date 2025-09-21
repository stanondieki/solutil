const Service = require('../models/Service');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// @desc    Get all services with filtering, sorting, and pagination
// @route   GET /api/services
// @access  Public
exports.getServices = catchAsync(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filters = { isActive: true };
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filters.basePrice = {};
      if (req.query.minPrice) filters.basePrice.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filters.basePrice.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      sort = sortBy;
    } else {
      sort = { isPopular: -1, 'rating.average': -1, createdAt: -1 };
    }

    // Execute query
    const services = await Service.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('reviews', 'rating comment user createdAt', null, { limit: 3 });

    const total = await Service.countDocuments(filters);

    res.status(200).json({
      status: 'success',
      results: services.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      data: {
        services
      }
    });
  } catch (err) {
    logger.error('Service fetch error:', err);
    res.status(500).json({ status: 'error', message: err.message, stack: err.stack });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
    .populate('reviews', 'rating comment user createdAt')
    .populate('providers', 'businessName user rating location');

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider/Admin)
exports.createService = catchAsync(async (req, res, next) => {
  // For now, we'll create the service without provider association
  // In a complete implementation, you'd link it to the provider
  
  const serviceData = {
    ...req.body,
    // Add any additional fields based on user context
  };

  const service = await Service.create(serviceData);

  logger.info(`New service created: ${service.name}`, {
    serviceId: service._id,
    createdBy: req.user.id
  });

  res.status(201).json({
    status: 'success',
    message: 'Service created successfully',
    data: {
      service
    }
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider/Admin)
exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Check ownership (simplified - in real app, check if user owns this service)
  if (req.user.userType !== 'admin') {
    // Add ownership check here
  }

  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  logger.info(`Service updated: ${updatedService.name}`, {
    serviceId: updatedService._id,
    updatedBy: req.user.id
  });

  res.status(200).json({
    status: 'success',
    message: 'Service updated successfully',
    data: {
      service: updatedService
    }
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider/Admin)
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Check ownership (simplified)
  if (req.user.userType !== 'admin') {
    // Add ownership check here
  }

  // Soft delete by setting isActive to false
  await Service.findByIdAndUpdate(req.params.id, { isActive: false });

  logger.info(`Service deleted: ${service.name}`, {
    serviceId: service._id,
    deletedBy: req.user.id
  });

  res.status(200).json({
    status: 'success',
    message: 'Service deleted successfully'
  });
});

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
exports.searchServices = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const services = await Service.searchServices(q, {
    isActive: true,
    ...(req.query.category && { category: req.query.category })
  })
    .skip(skip)
    .limit(limit);

  const total = await Service.countDocuments({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: services.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    },
    data: {
      services
    }
  });
});

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
exports.getPopularServices = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;
  
  const services = await Service.getPopularServices(limit);

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
exports.getServicesByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const services = await Service.find({ 
    category, 
    isActive: true 
  })
    .sort({ isPopular: -1, 'rating.average': -1 })
    .skip(skip)
    .limit(limit)
    .populate('reviews', 'rating comment user createdAt', null, { limit: 3 });

  const total = await Service.countDocuments({ category, isActive: true });

  res.status(200).json({
    status: 'success',
    results: services.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    },
    data: {
      services
    }
  });
});
