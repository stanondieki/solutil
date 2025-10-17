const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ProviderService = require('../models/ProviderService');
const { protect } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper function to convert onboarding services to ProviderServices
const convertOnboardingServicesToProviderServices = async (provider) => {
  // Check if provider has services from onboarding
  const onboardingServices = provider.providerProfile?.services;
  
  if (!onboardingServices || !Array.isArray(onboardingServices) || onboardingServices.length === 0) {
    console.log(`No onboarding services found for provider: ${provider.email}, creating default service`);
    
    // Create a default service based on provider's main skill/category
    const mainSkill = provider.providerProfile?.skills?.[0] || 'general';
    const defaultService = {
      title: `${mainSkill.charAt(0).toUpperCase() + mainSkill.slice(1)} Services`,
      category: mainSkill.toLowerCase(),
      price: provider.providerProfile?.hourlyRate || 1000,
      priceType: 'hourly',
      description: `Professional ${mainSkill} services by ${provider.name}`
    };
    
    // Use the default service as the only service
    await createProviderService(provider, defaultService);
    return;
  }

  console.log(`Converting ${onboardingServices.length} onboarding services for provider: ${provider.email}`);

  // Convert each onboarding service to a ProviderService
  for (const service of onboardingServices) {
    await createProviderService(provider, service);
  }
};

// Helper function to create a single provider service
const createProviderService = async (provider, service) => {
  try {
    // Check if service already exists to avoid duplicates
    const existingService = await ProviderService.findOne({
      providerId: provider._id,
      title: service.title,
      category: service.category
    });

    if (existingService) {
      console.log(`Service already exists: ${service.title} for provider: ${provider.email}`);
      return existingService;
    }

    // Create ProviderService from onboarding service data
    const providerService = new ProviderService({
      title: service.title,
      description: service.description || `Professional ${service.category} service by ${provider.name}`,
      category: service.category.toLowerCase(),
      price: parseFloat(service.price) || provider.providerProfile?.hourlyRate || 1000,
      priceType: service.priceType || 'hourly',
      duration: 60, // Default 1 hour duration
      images: [], // Will be populated later if provider uploads images
      isActive: true,
      serviceArea: provider.providerProfile?.serviceAreas || ['nairobi'],
      availableHours: {
        start: provider.providerProfile?.availability?.hours?.start || '08:00',
        end: provider.providerProfile?.availability?.hours?.end || '18:00'
      },
      tags: [service.category, 'professional', 'verified'],
      providerId: provider._id,
      // Initialize stats
      totalBookings: 0,
      totalRevenue: 0,
      rating: 0,
      reviewCount: 0
    });

    await providerService.save();
    console.log(`Created ProviderService: ${service.title} for provider: ${provider.email}`);
    return providerService;

  } catch (error) {
    console.error(`Error creating service ${service.title} for provider ${provider.email}:`, error);
    return null;
  }
};

// @desc    Get featured providers
// @route   GET /api/providers/featured
// @access  Private (for clients)
router.get('/featured', protect, catchAsync(async (req, res, next) => {
  const { limit = 6 } = req.query;

  // Get featured providers - those with highest ratings and most completed jobs
  const providers = await User.find({
    userType: 'provider',
    providerStatus: 'approved'
  })
  .select('name email profilePicture avatar providerProfile providerStatus createdAt')
  .sort({ 
    'providerProfile.rating': -1, 
    'providerProfile.completedJobs': -1,
    createdAt: -1 
  })
  .limit(parseInt(limit));

  // Map providers to include enhanced data
  const featuredProviders = providers.map(provider => {
    const providerInfo = provider.providerProfile || {};
    
    return {
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      profilePicture: provider.avatar?.url || provider.profilePicture || null,
      providerProfile: {
        businessName: providerInfo.businessName || provider.name,
        experience: providerInfo.experience || 'Experienced professional',
        skills: providerInfo.skills || [],
        hourlyRate: providerInfo.hourlyRate || 1500,
        availability: providerInfo.availability || {},
        serviceAreas: providerInfo.serviceAreas || [],
        bio: providerInfo.bio || '',
        completedJobs: providerInfo.completedJobs || 0,
        rating: providerInfo.rating || 4.5,
        reviewCount: providerInfo.reviewCount || 0,
        services: providerInfo.services || []
      },
      services: [],
      providerStatus: provider.providerStatus,
      createdAt: provider.createdAt
    };
  });

  res.status(200).json({
    success: true,
    count: featuredProviders.length,
    providers: featuredProviders
  });
}));

// @desc    Get all approved providers
// @route   GET /api/providers
// @access  Private (for clients to see providers)
router.get('/', protect, catchAsync(async (req, res, next) => {
  const { 
    featured, 
    service, 
    limit = 10, 
    page = 1,
    area 
  } = req.query;

  // Base filter for approved providers only
  let filter = { 
    userType: 'provider', 
    providerStatus: 'approved' 
  };

  // Add service area filter if specified
  if (area) {
    filter['providerProfile.serviceAreas'] = { $in: [area] };
  }

  // Add service skills filter if specified  
  if (service) {
    filter['providerProfile.skills'] = { $in: [service] };
  }

  // Build the query
  let query = User.find(filter)
    .select('name email profilePicture avatar providerProfile providerStatus createdAt')
    .sort({ 'providerProfile.rating': -1, createdAt: -1 });

  // Apply limit
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  
  query = query.limit(limitNum).skip((pageNum - 1) * limitNum);

  const providers = await query;
  const total = await User.countDocuments(filter);

  // Map providers to include profile picture, enhanced data, and their services
  const mappedProviders = await Promise.all(providers.map(async (provider) => {
    const providerInfo = provider.providerProfile || {};
    
    // Fetch provider's services from ProviderService model
    let providerServices = [];
    try {
      providerServices = await ProviderService.find({
        providerId: provider._id,
        isActive: true
      }).select('title description category price priceType duration images').limit(5); // Limit to 5 services for performance
    } catch (error) {
      console.error(`Error fetching services for provider ${provider._id}:`, error);
    }
    
    return {
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      profilePicture: provider.avatar?.url || provider.profilePicture || null, // Check both avatar.url and profilePicture
      providerProfile: {
        experience: providerInfo.experience,
        skills: providerInfo.skills || [],
        hourlyRate: providerInfo.hourlyRate,
        availability: providerInfo.availability,
        serviceAreas: providerInfo.serviceAreas || [],
        bio: providerInfo.bio,
        completedJobs: providerInfo.completedJobs || 0,
        rating: providerInfo.rating || 0,
        reviewCount: providerInfo.reviewCount || 0,
        services: providerInfo.services || [] // Include onboarding services
      },
      services: providerServices, // Include actual ProviderServices
      providerStatus: provider.providerStatus,
      createdAt: provider.createdAt
    };
  }));

  res.status(200).json({
    status: 'success',
    results: mappedProviders.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: {
      providers: mappedProviders
    }
  });
}));

// @desc    Get featured providers
// @route   GET /api/providers/featured
// @access  Private (for clients to see featured providers)
router.get('/featured', protect, catchAsync(async (req, res, next) => {
  const { limit = 6 } = req.query;

  // Get top-rated approved providers
  const providers = await User.find({ 
    userType: 'provider', 
    providerStatus: 'approved',
    'providerProfile.rating': { $gte: 4.0 } // Only featured providers with good ratings
  })
    .select('name email profilePicture avatar providerProfile providerStatus createdAt')
    .sort({ 
      'providerProfile.rating': -1, 
      'providerProfile.completedJobs': -1,
      createdAt: -1 
    })
    .limit(parseInt(limit));

  // Map providers to include enhanced data and their services
  const mappedProviders = await Promise.all(providers.map(async (provider) => {
    const providerInfo = provider.providerProfile || {};
    
    // Fetch provider's services from ProviderService model
    let providerServices = [];
    try {
      providerServices = await ProviderService.find({
        providerId: provider._id,
        isActive: true
      }).select('title description category price priceType duration images').limit(3); // Limit for featured view
    } catch (error) {
      console.error(`Error fetching services for provider ${provider._id}:`, error);
    }
    
    return {
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      profilePicture: provider.avatar?.url || provider.profilePicture || null,
      providerProfile: {
        businessName: providerInfo.businessName || provider.name,
        experience: providerInfo.experience || 'Experienced professional',
        skills: providerInfo.skills || [],
        hourlyRate: providerInfo.hourlyRate || 1500,
        availability: providerInfo.availability || {},
        serviceAreas: providerInfo.serviceAreas || [],
        bio: providerInfo.bio || 'Professional service provider',
        completedJobs: providerInfo.completedJobs || 0,
        rating: providerInfo.rating || 4.5,
        reviewCount: providerInfo.reviewCount || 0,
        services: providerInfo.services || []
      },
      services: providerServices,
      providerStatus: provider.providerStatus,
      createdAt: provider.createdAt
    };
  }));

  res.status(200).json({
    status: 'success',
    results: mappedProviders.length,
    data: {
      providers: mappedProviders
    }
  });
}));

// @desc    Complete provider profile
// @route   POST /api/provider/complete-profile
// @access  Private
router.post('/complete-profile', catchAsync(async (req, res, next) => {
  const { userId, providerInfo, documents } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  // Update provider profile
  user.providerProfile = {
    experience: providerInfo.experience,
    skills: providerInfo.skills,
    hourlyRate: Number(providerInfo.hourlyRate),
    availability: providerInfo.availability,
    serviceAreas: providerInfo.serviceAreas,
    bio: providerInfo.bio,
    completedJobs: 0,
    rating: 0,
    reviewCount: 0
  };

  // Update provider status to under_review
  user.providerStatus = 'under_review';

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Provider profile completed successfully',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        providerStatus: user.providerStatus,
        providerProfile: user.providerProfile
      }
    }
  });
}));

// @desc    Get provider applications for admin
// @route   GET /api/provider/applications
// @access  Private (Admin only)
router.get('/applications', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const { status = 'all', page = 1, limit = 10 } = req.query;

  let filter = { userType: 'provider' };
  if (status !== 'all') {
    filter.providerStatus = status;
  }

  const providers = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: providers.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      providers
    }
  });
}));

// @desc    Approve provider
// @route   POST /api/provider/:id/approve
// @access  Private (Admin only)
router.post('/:id/approve', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const { adminNote } = req.body;

  const provider = await User.findById(req.params.id);
  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (provider.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  // Update provider status
  provider.providerStatus = 'approved';
  provider.approvedBy = req.user._id;
  provider.approvedAt = new Date();

  // Add admin note
  if (adminNote) {
    provider.adminNotes.push({
      note: adminNote,
      admin: req.user._id,
      type: 'approval'
    });
  }

  await provider.save();

  // Convert onboarding services to actual ProviderServices
  try {
    await convertOnboardingServicesToProviderServices(provider);
    logger.info(`Converted onboarding services for approved provider: ${provider.email}`);
  } catch (error) {
    logger.error(`Error converting onboarding services for ${provider.email}:`, error);
    // Don't fail the approval if service conversion fails
  }

  res.status(200).json({
    status: 'success',
    message: 'Provider approved successfully',
    data: {
      provider: {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        providerStatus: provider.providerStatus,
        approvedAt: provider.approvedAt
      }
    }
  });
}));

// @desc    Get single provider details
// @route   GET /api/provider/:id
// @access  Private (Admin or Provider)
router.get('/:id', protect, catchAsync(async (req, res, next) => {
  const provider = await User.findById(req.params.id).select('-password');
  if (!provider || provider.userType !== 'provider') {
    return next(new AppError('Provider not found', 404));
  }
  // Only admin or the provider themselves can view
  if (req.user.userType !== 'admin' && req.user._id.toString() !== provider._id.toString()) {
    return next(new AppError('Access denied.', 403));
  }
  res.status(200).json({
    status: 'success',
    data: { provider }
  });
}));

// @desc    Reject or suspend provider
// @route   POST /api/provider/:id/reject
// @access  Private (Admin only)
router.post('/:id/reject', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }
  const provider = await User.findById(req.params.id);
  if (!provider || provider.userType !== 'provider') {
    return next(new AppError('Provider not found', 404));
  }
  provider.providerStatus = 'rejected';
  provider.rejectedAt = new Date();
  provider.adminNotes.push({
    note: req.body.note || 'Provider rejected',
    admin: req.user._id,
    type: 'rejection'
  });
  await provider.save();
  res.status(200).json({ status: 'success', message: 'Provider rejected', data: { provider } });
}));

// @desc    Update provider profile (admin)
// @route   PATCH /api/provider/:id/profile
// @access  Private (Admin only)
router.patch('/:id/profile', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }
  const provider = await User.findById(req.params.id);
  if (!provider || provider.userType !== 'provider') {
    return next(new AppError('Provider not found', 404));
  }
  provider.providerProfile = { ...provider.providerProfile, ...req.body };
  await provider.save();
  res.status(200).json({ status: 'success', message: 'Provider profile updated', data: { provider } });
}));

// @desc    List all verified providers (for users)
// @route   GET /api/provider/verified
// @access  Public
router.get('/verified/all', catchAsync(async (req, res, next) => {
  const { area, skill, page = 1, limit = 10 } = req.query;
  let filter = { userType: 'provider', providerStatus: 'approved' };
  if (area) filter['providerProfile.serviceAreas'] = area;
  if (skill) filter['providerProfile.skills'] = skill;
  const providers = await User.find(filter)
    .select('name providerProfile providerStatus avatar address rating reviewCount')
    .sort({ rating: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await User.countDocuments(filter);
  res.status(200).json({
    status: 'success',
    results: providers.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: { providers }
  });
}));

// @desc    Get single verified provider profile (public)
// @route   GET /api/providers/public/:id
// @access  Public
router.get('/public/:id', catchAsync(async (req, res, next) => {
  const provider = await User.findById(req.params.id)
    .select('name email phone profilePicture avatar providerProfile providerStatus createdAt address')
    .populate('approvedBy', 'name email');

  if (!provider || provider.userType !== 'provider' || provider.providerStatus !== 'approved') {
    return next(new AppError('Provider not found or not available', 404));
  }

  // Fetch provider's services
  let providerServices = [];
  try {
    providerServices = await ProviderService.find({
      providerId: provider._id,
      isActive: true
    }).select('title description category price priceType duration images rating reviewCount totalBookings');
  } catch (error) {
    console.error(`Error fetching services for provider ${provider._id}:`, error);
  }

  // Format provider data for public viewing
  const publicProviderData = {
    _id: provider._id,
    name: provider.name,
    email: provider.email,
    phone: provider.phone,
    profilePicture: provider.avatar?.url || provider.profilePicture || null,
    providerProfile: {
      businessName: provider.providerProfile?.businessName || provider.name,
      experience: provider.providerProfile?.experience || 'Experienced professional',
      skills: provider.providerProfile?.skills || [],
      hourlyRate: provider.providerProfile?.hourlyRate || 0,
      availability: provider.providerProfile?.availability || {},
      serviceAreas: provider.providerProfile?.serviceAreas || [],
      bio: provider.providerProfile?.bio || '',
      completedJobs: provider.providerProfile?.completedJobs || 0,
      rating: provider.providerProfile?.rating || 0,
      reviewCount: provider.providerProfile?.reviewCount || 0
    },
    services: providerServices,
    providerStatus: provider.providerStatus,
    memberSince: provider.createdAt,
    address: provider.address || {}
  };

  res.status(200).json({
    status: 'success',
    data: {
      provider: publicProviderData
    }
  });
}));

// @desc    Backfill services for existing approved providers
// @route   POST /api/providers/backfill-services
// @access  Private (Admin only)
router.post('/backfill-services', protect, catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  // Get all approved providers who might not have services
  const approvedProviders = await User.find({
    userType: 'provider',
    providerStatus: 'approved'
  });

  let processedCount = 0;
  let servicesCreated = 0;

  for (const provider of approvedProviders) {
    try {
      // Check if provider already has services
      const existingServicesCount = await ProviderService.countDocuments({ 
        providerId: provider._id 
      });

      if (existingServicesCount === 0) {
        // Provider has no services, convert onboarding services
        await convertOnboardingServicesToProviderServices(provider);
        
        // Count services created
        const newServicesCount = await ProviderService.countDocuments({ 
          providerId: provider._id 
        });
        servicesCreated += newServicesCount;
      }
      
      processedCount++;
    } catch (error) {
      logger.error(`Error processing provider ${provider.email}:`, error);
    }
  }

  logger.info(`Backfilled services: ${processedCount} providers processed, ${servicesCreated} services created`);

  res.status(200).json({
    status: 'success',
    message: 'Service backfill completed',
    data: {
      providersProcessed: processedCount,
      servicesCreated: servicesCreated
    }
  });
}));

module.exports = router;
