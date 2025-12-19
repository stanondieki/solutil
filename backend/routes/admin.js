// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...

// ...existing code...

// ...existing code...
const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Import admin sub-routes
const adminProviderRoutes = require('./admin/providers');
const adminEmailRoutes = require('./admin/email');
const adminDocumentRoutes = require('./admin/documents');

const router = express.Router();

// Middleware to check admin role
const adminOnly = catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
  next();
});

// Mount admin sub-routes
router.use('/providers', adminProviderRoutes);
router.use('/email', adminEmailRoutes);
router.use('/', adminDocumentRoutes);

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    // Get counts from database
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    const pendingProviders = await User.countDocuments({ 
      userType: 'provider', 
      providerStatus: { $in: ['pending', 'under_review'] }
    });
    const verifiedProviders = await User.countDocuments({ 
      userType: 'provider', 
      providerStatus: 'verified' 
    });
    
    // Get booking statistics if Booking model exists
    let totalBookings = 0;
    let completedBookings = 0;
    try {
      totalBookings = await Booking.countDocuments();
      completedBookings = await Booking.countDocuments({ status: 'completed' });
    } catch (error) {
      console.log('Booking collection not found, using default values');
    }

    // Calculate revenue (mock calculation based on completed bookings)
    const totalRevenue = completedBookings * 1500; // Average booking value
    
    // Calculate growth (mock - could be based on monthly comparisons)
    const monthlyGrowth = 12.5;

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalProviders,
        pendingVerifications: pendingProviders,
        verifiedProviders,
        totalBookings,
        completedBookings,
        totalRevenue,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
}));

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { userType, providerStatus, search, page = 1, limit = 50 } = req.query;

    // Build filter query
    let filter = {};
    
    if (userType && userType !== 'all') {
      filter.userType = userType;
    }
    
    if (providerStatus && providerStatus !== 'all') {
      filter.providerStatus = providerStatus;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch users
    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNext: skip + users.length < totalUsers,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
}));

// @desc    Get providers with verification details
// @route   GET /api/admin/providers
// @access  Private/Admin
router.get('/providers', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    // Build filter for providers only
    let filter = { userType: 'provider' };
    
    if (status && status !== 'all') {
      filter.providerStatus = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const providers = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalProviders = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        providers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProviders / parseInt(limit)),
          totalProviders,
          hasNext: skip + providers.length < totalProviders,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch providers'
    });
  }
}));

// @desc    Update user/provider status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { action, providerStatus, isActive, notes } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        if (user.userType === 'provider') {
          updateData.providerStatus = 'verified';
          updateData.isActive = true;
          message = 'Provider approved successfully';
        }
        break;
        
      case 'reject':
        if (user.userType === 'provider') {
          updateData.providerStatus = 'rejected';
          message = 'Provider rejected';
        }
        break;
        
      case 'suspend':
        updateData.isActive = false;
        message = 'User suspended';
        break;
        
      case 'reactivate':
        updateData.isActive = true;
        if (user.userType === 'provider') {
          updateData.providerStatus = 'verified';
        }
        message = 'User reactivated';
        break;
        
      case 'updateStatus':
        if (providerStatus) {
          updateData.providerStatus = providerStatus;
          message = `Provider status updated to ${providerStatus}`;
        }
        if (typeof isActive === 'boolean') {
          updateData.isActive = isActive;
        }
        break;
        
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action'
        });
    }

    // Add admin notes if provided
    if (notes) {
      updateData.$push = { adminNotes: { note: notes, addedBy: req.user._id, addedAt: new Date() } };
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password');

    res.status(200).json({
      status: 'success',
      message,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
}));

// @desc    Verify/reject provider documents
// @route   PUT /api/admin/providers/:id/documents
// @access  Private/Admin
router.put('/providers/:id/documents', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, action, notes } = req.body; // action: 'verify' or 'reject'

    const user = await User.findById(id);
    if (!user || user.userType !== 'provider') {
      return res.status(404).json({
        status: 'error',
        message: 'Provider not found'
      });
    }

    const documentPath = `providerDocuments.${documentType}`;
    const updateData = {
      [`${documentPath}.verified`]: action === 'verify',
      [`${documentPath}.verifiedAt`]: new Date(),
      [`${documentPath}.verifiedBy`]: req.user._id
    };

    if (notes) {
      updateData[`${documentPath}.notes`] = notes;
    }

    await User.findByIdAndUpdate(id, updateData);

    // Check if all documents are verified to update provider status
    const updatedUser = await User.findById(id);
    const docs = updatedUser.providerDocuments;
    
    if (docs && docs.nationalId?.verified && docs.businessLicense?.verified && docs.certificate?.verified) {
      await User.findByIdAndUpdate(id, { providerStatus: 'verified' });
    } else if (action === 'reject') {
      await User.findByIdAndUpdate(id, { providerStatus: 'under_review' });
    }

    res.status(200).json({
      status: 'success',
      message: `Document ${action === 'verify' ? 'verified' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update document'
    });
  }
}));

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false and adding deletion info
    const updatedUser = await User.findByIdAndUpdate(id, {
      isActive: false,
      deletedBy: req.user._id,
      deletedAt: new Date()
    }, { new: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
}));

// @desc    Get all services with admin filters
// @route   GET /api/admin/services  
// @access  Private/Admin
router.get('/services', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      search,
      isActive 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      // Database is connected - use normal Mongoose queries
      const services = await Service.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reviews', 'rating comment user createdAt', null, { limit: 3 });

      const total = await Service.countDocuments(filter);

      res.status(200).json({
        status: 'success',
        results: services.length,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        data: {
          services
        }
      });
    } else {
      // Database not connected - use mock data
      const mockDataService = require('../utils/mockDataService');
      const result = await mockDataService.findServices(filter, { 
        skip, 
        limit: parseInt(limit), 
        sort: true 
      });
      
      res.status(200).json({
        status: 'success',
        results: result.services.length,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(result.total / parseInt(limit)),
          total: result.total,
          limit: parseInt(limit)
        },
        data: {
          services: result.services
        }
      });
    }
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch services'
    });
  }
}));

// @desc    Get single service by ID for admin
// @route   GET /api/admin/services/:id
// @access  Private/Admin
router.get('/services/:id', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    let service;

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      service = await Service.findById(req.params.id)
        .populate('reviews', 'rating comment user createdAt')
        .populate('providers', 'businessName user rating location');
    } else {
      // Database not connected - use mock data
      const mockDataService = require('../utils/mockDataService');
      service = await mockDataService.findServiceById(req.params.id);
    }

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Error fetching admin service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch service'
    });
  }
}));

// @desc    Create new service (admin)
// @route   POST /api/admin/services
// @access  Private/Admin
router.post('/services', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      createdBy: req.user._id
    };

    let service;

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      service = await Service.create(serviceData);
    } else {
      // Database not connected - use mock data
      const mockDataService = require('../utils/mockDataService');
      service = await mockDataService.createService(serviceData);
    }

    res.status(201).json({
      status: 'success',
      message: 'Service created successfully',
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Error creating admin service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create service'
    });
  }
}));

// @desc    Update service (admin)
// @route   PUT /api/admin/services/:id
// @access  Private/Admin
router.put('/services/:id', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    let service;

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      service = await Service.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      // Database not connected - use mock data
      const mockDataService = require('../utils/mockDataService');
      service = await mockDataService.findServiceById(req.params.id);
      if (service) {
        Object.assign(service, req.body);
        service.updatedAt = new Date();
      }
    }

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Service updated successfully',
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Error updating admin service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update service'
    });
  }
}));

// @desc    Toggle service active status
// @route   PUT /api/admin/services/:id/toggle-active
// @access  Private/Admin
router.put('/services/:id/toggle-active', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    let service;

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      service = await Service.findById(req.params.id);
      if (service) {
        service.isActive = !service.isActive;
        service.updatedAt = new Date();
        await service.save();
      }
    } else {
      // Database not connected - use mock data
      const mockDataService = require('../utils/mockDataService');
      service = await mockDataService.findServiceById(req.params.id);
      if (service) {
        service.isActive = !service.isActive;
        service.updatedAt = new Date();
      }
    }

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle service status'
    });
  }
}));

// @desc    Delete service (admin)
// @route   DELETE /api/admin/services/:id
// @access  Private/Admin
router.delete('/services/:id', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    let service;

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      service = await Service.findByIdAndDelete(req.params.id);
    } else {
      // Database not connected - use mock data
      const mockDataService = require('../utils/mockDataService');
      service = await mockDataService.findServiceById(req.params.id);
      if (service) {
        // In mock mode, just return success (can't actually delete from array easily)
        service.deleted = true;
      }
    }

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete service'
    });
  }
}));

// @desc    Bulk action on services (admin)
// @route   POST /api/admin/services/bulk-action
// @access  Private/Admin
router.post('/services/bulk-action', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { action, serviceIds } = req.body;

    if (!action || !serviceIds || !Array.isArray(serviceIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'Action and serviceIds are required'
      });
    }

    let result;

    // Check if database is connected
    if (global.isDbConnected && global.isDbConnected()) {
      switch (action) {
        case 'activate':
          result = await Service.updateMany(
            { _id: { $in: serviceIds } },
            { isActive: true, updatedAt: new Date() }
          );
          break;
        case 'deactivate':
          result = await Service.updateMany(
            { _id: { $in: serviceIds } },
            { isActive: false, updatedAt: new Date() }
          );
          break;
        case 'delete':
          result = await Service.deleteMany({ _id: { $in: serviceIds } });
          break;
        default:
          return res.status(400).json({
            status: 'error',
            message: 'Invalid action'
          });
      }
    } else {
      // Database not connected - use mock data
      result = { modifiedCount: serviceIds.length }; // Mock result
    }

    res.status(200).json({
      status: 'success',
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || serviceIds.length
      }
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to perform bulk action'
    });
  }
}));

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    console.log('🔍 Admin bookings request:', { status, search, page, limit });

    // Build filter query
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      // Search in booking number only for now (populated fields can't be searched this way)
      filter.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('📋 Fetching bookings with filter:', filter);

    // Fetch bookings first without service population
    const bookings = await Booking.find(filter)
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${bookings.length} bookings (before service population)`);

    // Manually populate services based on serviceType
    for (let booking of bookings) {
      if (booking.service && booking.serviceType === 'ProviderService') {
        try {
          const ProviderService = require('../models/ProviderService');
          const service = await ProviderService.findById(booking.service)
            .select('title category description price');
          booking.service = service;
        } catch (error) {
          console.log(`⚠️ Could not populate ProviderService for booking ${booking.bookingNumber}`);
          booking.service = null;
        }
      } else if (booking.service && booking.serviceType === 'Service') {
        try {
          const Service = require('../models/Service');
          const service = await Service.findById(booking.service)
            .select('name category description basePrice');
          booking.service = service;
        } catch (error) {
          console.log(`⚠️ Could not populate Service for booking ${booking.bookingNumber}`);
          booking.service = null;
        }
      }
    }

    const totalCount = await Booking.countDocuments(filter);

    console.log(`✅ Found ${bookings.length} bookings out of ${totalCount} total`);

    // Log sample booking for debugging
    if (bookings.length > 0) {
      console.log('📋 Sample booking:', {
        id: bookings[0]._id,
        bookingNumber: bookings[0].bookingNumber,
        client: bookings[0].client?.name || 'null',
        provider: bookings[0].provider?.name || 'null',
        service: bookings[0].service?.name || bookings[0].service?.title || 'null',
        status: bookings[0].status
      });
    }

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      total: totalCount,
      page: parseInt(page),
      pages: Math.ceil(totalCount / parseInt(limit)),
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
}));

// @desc    Update booking status (admin only)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
router.put('/bookings/:id/status', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        status,
        ...(notes && { adminNotes: notes }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('client', 'name email')
     .populate('provider', 'name email')
     .populate('service', 'name title');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
}));

// =====================================================
// PROVIDER ASSIGNMENT ROUTES
// =====================================================

// @desc    Get available providers for a booking (supports multiple providers)
// @route   GET /api/admin/bookings/:id/available-providers
// @access  Private/Admin
router.get('/bookings/:id/available-providers', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const ProviderService = require('../models/ProviderService');
    
    // Get the booking to understand what category is needed
    const booking = await Booking.findById(id)
      .populate('providers.provider', 'name email phone providerProfile');
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Get the service category from the booking - check multiple sources
    let serviceCategory = 'other';
    
    // Priority 1: Check the serviceCategory field
    if (booking.serviceCategory && booking.serviceCategory !== 'undefined') {
      serviceCategory = booking.serviceCategory;
    }
    
    // Priority 2: Check metadata.categoryRequested (from enhanced booking)
    if (serviceCategory === 'other' && booking.metadata?.categoryRequested) {
      serviceCategory = booking.metadata.categoryRequested;
    }
    
    // Priority 3: Try to get from the associated service
    if (serviceCategory === 'other' && booking.service) {
      if (booking.serviceType === 'ProviderService') {
        const service = await ProviderService.findById(booking.service);
        if (service && service.category) {
          serviceCategory = service.category;
        }
      }
    }
    
    // Normalize category name to category ID for matching
    const categoryNameToId = {
      'Plumbing': 'plumbing',
      'Electrical': 'electrical',
      'Cleaning': 'cleaning',
      'Carpentry': 'carpentry',
      'Painting': 'painting',
      'Gardening': 'gardening',
      'Moving': 'movers',
      'General Service': 'other'
    };
    
    // Convert category name to ID if needed
    const normalizedCategory = categoryNameToId[serviceCategory] || serviceCategory.toLowerCase();
    
    console.log(`🔍 Category detection: raw="${booking.serviceCategory}", metadata="${booking.metadata?.categoryRequested}", normalized="${normalizedCategory}"`);

    // Get already assigned provider IDs
    const alreadyAssignedIds = booking.providers?.map(
      p => (p.provider._id || p.provider).toString()
    ) || [];
    
    // Include legacy provider field if not in providers array
    if (booking.provider && !alreadyAssignedIds.includes(booking.provider.toString())) {
      alreadyAssignedIds.push(booking.provider.toString());
    }

    console.log(`🔍 Finding providers for category: ${normalizedCategory}, date: ${booking.scheduledDate}, time: ${booking.scheduledTime?.start}`);
    console.log(`📋 Already assigned: ${alreadyAssignedIds.length} providers`);

    // Find all approved providers
    const allProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    }).select('name email phone providerProfile');

    // Get provider services to match category
    const providerServices = await ProviderService.find({
      category: { $regex: normalizedCategory, $options: 'i' },
      isActive: true
    }).populate('providerId', 'name email phone providerProfile providerStatus');

    // Filter to only approved providers with matching services
    const matchingProviders = providerServices
      .filter(ps => ps.providerId && ps.providerId.providerStatus === 'approved')
      .map(ps => ({
        id: ps.providerId._id,
        name: ps.providerId.name,
        email: ps.providerId.email,
        phone: ps.providerId.phone,
        rating: ps.providerId.providerProfile?.rating || 4.0,
        totalJobs: ps.providerId.providerProfile?.totalJobs || 0,
        serviceId: ps._id,
        serviceTitle: ps.title,
        servicePrice: ps.price
      }));

    // Check for time slot conflicts (with OTHER bookings)
    const bookedProviderIds = await Booking.find({
      $or: [
        { provider: { $exists: true, $ne: null } },
        { 'providers.provider': { $exists: true } }
      ],
      scheduledDate: booking.scheduledDate,
      'scheduledTime.start': booking.scheduledTime?.start,
      status: { $nin: ['cancelled', 'completed'] },
      _id: { $ne: id } // Exclude current booking
    }).distinct('provider');
    
    // Also get providers from the providers array in other bookings
    const otherBookingsWithProviders = await Booking.find({
      'providers.0': { $exists: true },
      scheduledDate: booking.scheduledDate,
      'scheduledTime.start': booking.scheduledTime?.start,
      status: { $nin: ['cancelled', 'completed'] },
      _id: { $ne: id }
    }).select('providers');
    
    const bookedFromProvidersArray = otherBookingsWithProviders.flatMap(
      b => b.providers.map(p => (p.provider._id || p.provider).toString())
    );

    const bookedProviderStrings = [
      ...bookedProviderIds.map(id => id?.toString()).filter(Boolean),
      ...bookedFromProvidersArray
    ];

    // Mark providers as available/unavailable/already-assigned
    const providersWithAvailability = matchingProviders.map(provider => {
      const isAlreadyAssigned = alreadyAssignedIds.includes(provider.id.toString());
      const isBookedElsewhere = bookedProviderStrings.includes(provider.id.toString());
      
      return {
        ...provider,
        alreadyAssigned: isAlreadyAssigned,
        available: !isAlreadyAssigned && !isBookedElsewhere,
        conflictReason: isAlreadyAssigned 
          ? 'Already assigned to this booking'
          : isBookedElsewhere 
            ? 'Already booked at this time' 
            : null
      };
    });

    // Sort: available first, then already assigned, then unavailable, then by rating
    providersWithAvailability.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.alreadyAssigned !== b.alreadyAssigned) return a.alreadyAssigned ? -1 : 1;
      return b.rating - a.rating;
    });

    // Also include all approved providers (even without matching service)
    const allApprovedProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    }).select('name email phone providerProfile');

    const otherProviders = allApprovedProviders
      .filter(p => !matchingProviders.some(mp => mp.id.toString() === p._id.toString()))
      .map(p => {
        const isAlreadyAssigned = alreadyAssignedIds.includes(p._id.toString());
        const isBookedElsewhere = bookedProviderStrings.includes(p._id.toString());
        
        return {
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          rating: p.providerProfile?.rating || 4.0,
          totalJobs: p.providerProfile?.totalJobs || 0,
          serviceId: null,
          serviceTitle: 'No matching service',
          servicePrice: null,
          alreadyAssigned: isAlreadyAssigned,
          available: !isAlreadyAssigned && !isBookedElsewhere,
          conflictReason: isAlreadyAssigned 
            ? 'Already assigned to this booking'
            : isBookedElsewhere 
              ? 'Already booked at this time' 
              : null,
          isOtherCategory: true
        };
      });

    // Get assignment status
    const providersNeeded = booking.providersNeeded || 1;
    const providersAssigned = alreadyAssignedIds.length;
    const isFullyAssigned = providersAssigned >= providersNeeded;

    res.status(200).json({
      status: 'success',
      data: {
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          serviceCategory,
          providersNeeded,
          providersAssigned,
          isFullyAssigned,
          slotsRemaining: Math.max(0, providersNeeded - providersAssigned),
          currentProvider: booking.provider,
          assignedProviders: booking.providers?.map(p => ({
            id: p.provider._id || p.provider,
            name: p.provider.name || 'Unknown',
            email: p.provider.email || '',
            phone: p.provider.phone || '',
            assignedAt: p.assignedAt,
            status: p.status
          })) || []
        },
        matchingProviders: providersWithAvailability,
        otherProviders: otherProviders,
        totalAvailable: providersWithAvailability.filter(p => p.available).length + 
                       otherProviders.filter(p => p.available).length
      }
    });
  } catch (error) {
    console.error('Error fetching available providers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available providers'
    });
  }
}));

// @desc    Assign provider to booking (supports multiple providers)
// @route   PUT /api/admin/bookings/:id/assign-provider
// @access  Private/Admin
router.put('/bookings/:id/assign-provider', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { providerId, serviceId, notes } = req.body;
    const ProviderService = require('../models/ProviderService');
    const notificationService = require('../services/notificationService');

    if (!providerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Provider ID is required'
      });
    }

    // Verify provider exists and is approved
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        status: 'error',
        message: 'Provider not found'
      });
    }

    if (provider.providerStatus !== 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Provider is not approved to accept bookings'
      });
    }

    // Get the booking
    const booking = await Booking.findById(id).populate('client', 'name email phone');
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if this provider is already assigned to this booking
    const alreadyAssigned = booking.providers?.some(
      p => p.provider.toString() === providerId.toString()
    );
    if (alreadyAssigned) {
      return res.status(400).json({
        status: 'error',
        message: 'This provider is already assigned to this booking'
      });
    }

    // Check for time slot conflicts with OTHER bookings
    const existingBooking = await Booking.findOne({
      $or: [
        { provider: providerId },
        { 'providers.provider': providerId }
      ],
      scheduledDate: booking.scheduledDate,
      'scheduledTime.start': booking.scheduledTime?.start,
      status: { $nin: ['cancelled', 'completed'] },
      _id: { $ne: id }
    });

    if (existingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'This provider is already booked at this time slot',
        conflictBooking: existingBooking.bookingNumber
      });
    }

    // Determine which service to use
    let assignedService = serviceId;
    if (!assignedService) {
      const providerService = await ProviderService.findOne({
        providerId: providerId,
        isActive: true
      });
      if (providerService) {
        assignedService = providerService._id;
      }
    }

    // Initialize providers array if not exists
    if (!booking.providers) {
      booking.providers = [];
    }

    // Add provider to the providers array
    booking.providers.push({
      provider: providerId,
      service: assignedService,
      assignedAt: new Date(),
      assignedBy: req.user.id,
      status: 'assigned'
    });

    // Also set the legacy provider field (for backward compatibility)
    // Use the first provider or update if this is the primary
    if (!booking.provider || booking.providers.length === 1) {
      booking.provider = providerId;
      if (assignedService) {
        booking.service = assignedService;
        booking.serviceType = 'ProviderService';
      }
    }

    // Update status based on assignment progress
    const providersAssigned = booking.providers.length;
    const providersNeeded = booking.providersNeeded || 1;
    
    if (providersAssigned >= providersNeeded) {
      // All providers assigned - confirm the booking
      booking.status = 'confirmed';
    } else if (booking.status === 'pending') {
      // Partial assignment - keep as pending but add note
      booking.status = 'pending';
    }

    booking.assignedAt = new Date();
    booking.assignedBy = req.user.id;
    
    // Add to timeline
    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: 'provider-assigned',
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: notes || `Provider ${provider.name} assigned by admin (${providersAssigned}/${providersNeeded} providers)`
    });

    await booking.save();

    // Populate the updated booking
    await booking.populate([
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone providerProfile' },
      { path: 'providers.provider', select: 'name email phone providerProfile' }
    ]);

    // Send notifications
    try {
      await notificationService.sendProviderAssignmentNotification(booking, provider);
      
      // Only notify client when all providers are assigned
      if (providersAssigned >= providersNeeded) {
        await notificationService.sendClientProviderAssigned(booking, provider);
      }
      
      console.log(`✅ Notifications sent for provider assignment: ${booking.bookingNumber}`);
    } catch (notifyError) {
      console.error('⚠️ Failed to send assignment notifications:', notifyError);
    }

    // Create in-app notifications
    try {
      // Notify the provider about the assignment
      await Notification.createNotification({
        userId: providerId,
        title: 'New Booking Assignment',
        message: `You have been assigned to booking #${booking.bookingNumber} for ${booking.serviceCategory || 'service request'}`,
        type: 'booking',
        priority: 'high',
        actionUrl: `/provider/bookings/${booking._id}`,
        metadata: {
          bookingId: booking._id,
          bookingNumber: booking.bookingNumber,
          clientName: booking.client?.name
        }
      });

      // Only notify client when all providers are assigned
      if (providersAssigned >= providersNeeded && booking.client) {
        await Notification.createNotification({
          userId: booking.client._id,
          title: 'Provider Assigned',
          message: `A provider has been assigned to your booking #${booking.bookingNumber}. Your service is confirmed!`,
          type: 'booking',
          priority: 'high',
          actionUrl: `/bookings/${booking._id}`,
          metadata: {
            bookingId: booking._id,
            bookingNumber: booking.bookingNumber,
            providerName: provider.name
          }
        });
      }

      console.log(`✅ In-app notifications created for provider assignment: ${booking.bookingNumber}`);
    } catch (notifyError) {
      console.error('⚠️ Failed to create in-app notifications:', notifyError);
    }

    console.log(`✅ Provider ${provider.name} assigned to booking ${booking.bookingNumber} (${providersAssigned}/${providersNeeded})`);

    res.status(200).json({
      status: 'success',
      message: `Provider ${provider.name} successfully assigned (${providersAssigned}/${providersNeeded} providers)`,
      data: {
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          providersNeeded: providersNeeded,
          providersAssigned: providersAssigned,
          isFullyAssigned: providersAssigned >= providersNeeded,
          providers: booking.providers.map(p => ({
            id: p.provider._id || p.provider,
            name: p.provider.name || 'Loading...',
            email: p.provider.email || '',
            phone: p.provider.phone || '',
            assignedAt: p.assignedAt,
            status: p.status
          })),
          assignedAt: booking.assignedAt,
          client: booking.client
        }
      }
    });
  } catch (error) {
    console.error('Error assigning provider:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to assign provider: ' + error.message
    });
  }
}));

// @desc    Unassign provider from booking (supports multiple providers)
// @route   PUT /api/admin/bookings/:id/unassign-provider
// @access  Private/Admin
router.put('/bookings/:id/unassign-provider', protect, adminOnly, catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { providerId, reason } = req.body;

    const booking = await Booking.findById(id)
      .populate('provider', 'name email')
      .populate('providers.provider', 'name email')
      .populate('client', 'name email');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    let removedProvider = null;

    // If providerId is specified, remove that specific provider
    if (providerId) {
      // Find and remove from providers array
      const providerIndex = booking.providers?.findIndex(
        p => p.provider._id?.toString() === providerId.toString() || 
             p.provider.toString() === providerId.toString()
      );

      if (providerIndex > -1) {
        removedProvider = booking.providers[providerIndex].provider;
        booking.providers.splice(providerIndex, 1);
      }

      // If this was also the legacy provider field, clear it
      if (booking.provider?.toString() === providerId.toString() || 
          booking.provider?._id?.toString() === providerId.toString()) {
        booking.provider = null;
        // Set next available provider as the primary if exists
        if (booking.providers?.length > 0) {
          booking.provider = booking.providers[0].provider._id || booking.providers[0].provider;
        }
      }
    } else {
      // No specific provider - remove all providers
      removedProvider = booking.provider;
      booking.provider = null;
      booking.providers = [];
    }

    // Update status based on remaining providers
    const providersRemaining = booking.providers?.length || 0;
    const providersNeeded = booking.providersNeeded || 1;
    
    if (providersRemaining === 0) {
      booking.status = 'pending';
      booking.assignedAt = null;
    } else if (providersRemaining < providersNeeded) {
      // Partial assignment - keep confirmed but need more
      booking.status = 'pending';
    }
    
    // Add to timeline
    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: 'provider-unassigned',
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: reason || `Provider ${removedProvider?.name || 'unknown'} unassigned by admin (${providersRemaining}/${providersNeeded} remaining)`
    });

    await booking.save();

    // Create in-app notifications for unassignment
    try {
      // Notify the provider about unassignment
      if (removedProvider && (removedProvider._id || removedProvider)) {
        const removedProviderId = removedProvider._id || removedProvider;
        await Notification.createNotification({
          userId: removedProviderId,
          title: 'Booking Unassignment',
          message: `You have been unassigned from booking #${booking.bookingNumber}${reason ? ': ' + reason : ''}`,
          type: 'booking',
          priority: 'medium',
          actionUrl: `/provider/dashboard`,
          metadata: {
            bookingId: booking._id,
            bookingNumber: booking.bookingNumber,
            reason: reason
          }
        });
      }

      // Notify client about the change
      if (booking.client) {
        await Notification.createNotification({
          userId: booking.client._id,
          title: 'Booking Update',
          message: `There has been a change to your booking #${booking.bookingNumber}. A new provider will be assigned shortly.`,
          type: 'booking',
          priority: 'medium',
          actionUrl: `/bookings/${booking._id}`,
          metadata: {
            bookingId: booking._id,
            bookingNumber: booking.bookingNumber
          }
        });
      }

      console.log(`✅ In-app notifications created for provider unassignment: ${booking.bookingNumber}`);
    } catch (notifyError) {
      console.error('⚠️ Failed to create in-app notifications:', notifyError);
    }

    console.log(`✅ Provider unassigned from booking ${booking.bookingNumber} (${providersRemaining}/${providersNeeded} remaining)`);

    res.status(200).json({
      status: 'success',
      message: `Provider unassigned (${providersRemaining}/${providersNeeded} providers remaining)`,
      data: {
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          providersNeeded: providersNeeded,
          providersAssigned: providersRemaining,
          isFullyAssigned: providersRemaining >= providersNeeded,
          providers: booking.providers?.map(p => ({
            id: p.provider._id || p.provider,
            name: p.provider.name || 'Unknown',
            email: p.provider.email || '',
            assignedAt: p.assignedAt,
            status: p.status
          })) || []
        },
        removedProvider: removedProvider ? {
          id: removedProvider._id || removedProvider,
          name: removedProvider.name || 'Unknown',
          email: removedProvider.email || ''
        } : null
      }
    });
  } catch (error) {
    console.error('Error unassigning provider:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unassign provider'
    });
  }
}));

// =====================================================
// PAYOUT MANAGEMENT ROUTES
// =====================================================

// @desc    Get all payouts with filters
// @route   GET /api/admin/payouts
// @access  Private/Admin
router.get('/payouts', protect, adminOnly, catchAsync(async (req, res) => {
  const Payout = require('../models/Payout');
  
  const {
    status,
    provider,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (status) filter.status = status;
  if (provider) filter.provider = provider;
  
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }
  
  if (minAmount || maxAmount) {
    filter['amounts.payoutAmount'] = {};
    if (minAmount) filter['amounts.payoutAmount'].$gte = parseFloat(minAmount);
    if (maxAmount) filter['amounts.payoutAmount'].$lte = parseFloat(maxAmount);
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const payouts = await Payout.find(filter)
    .populate({
      path: 'provider',
      select: 'name email businessName phone payoutDetails'
    })
    .populate({
      path: 'client',
      select: 'name email phone'
    })
    .populate({
      path: 'booking',
      select: 'bookingId service pricing status',
      populate: {
        path: 'service',
        select: 'title category'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const totalPayouts = await Payout.countDocuments(filter);
  const totalPages = Math.ceil(totalPayouts / limit);

  // Calculate summary statistics
  const summaryStats = await Payout.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amounts.payoutAmount' },
        totalCommission: { $sum: '$amounts.commissionAmount' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      payouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPayouts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary: summaryStats,
      filters: { status, provider, dateFrom, dateTo, minAmount, maxAmount }
    }
  });
}));

// @desc    Get payout statistics
// @route   GET /api/admin/payout-stats
// @access  Private/Admin
router.get('/payout-stats', protect, adminOnly, catchAsync(async (req, res) => {
  const Payout = require('../models/Payout');
  const { period = '30d' } = req.query;
  
  // Calculate date range
  let dateFrom;
  switch (period) {
    case '7d': dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
    case '30d': dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break;
    case '90d': dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); break;
    case '1y': dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); break;
    default: dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const stats = await Payout.aggregate([
    {
      $facet: {
        overall: [{
          $group: {
            _id: null,
            totalPayouts: { $sum: 1 },
            totalPayoutAmount: { $sum: '$amounts.payoutAmount' },
            totalCommissionEarned: { $sum: '$amounts.commissionAmount' },
            avgPayoutAmount: { $avg: '$amounts.payoutAmount' }
          }
        }],
        byStatus: [{
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amounts.payoutAmount' }
          }
        }],
        recentPeriod: [{
          $match: { createdAt: { $gte: dateFrom } }
        }, {
          $group: {
            _id: null,
            periodPayouts: { $sum: 1 },
            periodPayoutAmount: { $sum: '$amounts.payoutAmount' },
            periodCommissionEarned: { $sum: '$amounts.commissionAmount' }
          }
        }],
        dailyBreakdown: [{
          $match: { createdAt: { $gte: dateFrom } }
        }, {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            payouts: { $sum: 1 },
            payoutAmount: { $sum: '$amounts.payoutAmount' },
            commission: { $sum: '$amounts.commissionAmount' }
          }
        }, {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overall: stats[0].overall[0] || {},
      byStatus: stats[0].byStatus,
      recentPeriod: stats[0].recentPeriod[0] || {},
      dailyBreakdown: stats[0].dailyBreakdown,
      period
    }
  });
}));

// @desc    Process payout manually
// @route   POST /api/admin/payouts/:id/process
// @access  Private/Admin
router.post('/payouts/:id/process', protect, adminOnly, catchAsync(async (req, res) => {
  const Payout = require('../models/Payout');
  const PayoutService = require('../services/payoutService');
  const { reason } = req.body;
  
  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    return res.status(404).json({
      status: 'error',
      message: 'Payout not found'
    });
  }

  if (payout.status !== 'pending' && payout.status !== 'ready') {
    return res.status(400).json({
      status: 'error',
      message: 'Payout is not in a processable state'
    });
  }

  try {
    const payoutService = new PayoutService();
    const result = await payoutService.processPayout(payout);

    // Add admin activity log
    payout.activities = payout.activities || [];
    payout.activities.push({
      type: 'admin_manual_process',
      description: `Manually processed by admin ${req.user.name}`,
      reason: reason || 'Manual admin processing',
      timestamp: new Date(),
      adminId: req.user._id
    });
    await payout.save();

    res.status(200).json({
      status: 'success',
      message: 'Payout processed manually',
      data: { payout, processResult: result }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process payout: ' + error.message
    });
  }
}));

// @desc    Cancel payout
// @route   POST /api/admin/payouts/:id/cancel
// @access  Private/Admin
router.post('/payouts/:id/cancel', protect, adminOnly, catchAsync(async (req, res) => {
  const Payout = require('../models/Payout');
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({
      status: 'error',
      message: 'Cancellation reason is required'
    });
  }

  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    return res.status(404).json({
      status: 'error',
      message: 'Payout not found'
    });
  }

  if (payout.status === 'completed' || payout.status === 'cancelled') {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot cancel this payout'
    });
  }

  payout.status = 'cancelled';
  payout.activities = payout.activities || [];
  payout.activities.push({
    type: 'admin_cancelled',
    description: `Cancelled by admin ${req.user.name}`,
    reason,
    timestamp: new Date(),
    adminId: req.user._id
  });
  await payout.save();

  res.status(200).json({
    status: 'success',
    message: 'Payout cancelled successfully',
    data: { payout }
  });
}));

// @desc    Retry failed payout
// @route   POST /api/admin/payouts/:id/retry
// @access  Private/Admin
router.post('/payouts/:id/retry', protect, adminOnly, catchAsync(async (req, res) => {
  const Payout = require('../models/Payout');
  const { reason } = req.body;
  
  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    return res.status(404).json({
      status: 'error',
      message: 'Payout not found'
    });
  }

  if (payout.status !== 'failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Only failed payouts can be retried'
    });
  }

  payout.status = 'ready';
  payout.activities = payout.activities || [];
  payout.activities.push({
    type: 'admin_retry',
    description: `Retry initiated by admin ${req.user.name}`,
    reason: reason || 'Admin retry',
    timestamp: new Date(),
    adminId: req.user._id
  });
  await payout.save();

  res.status(200).json({
    status: 'success',
    message: 'Payout queued for retry',
    data: { payout }
  });
}));

// @desc    Create manual payout (admin initiated)
// @route   POST /api/admin/payouts/create
// @access  Private/Admin
router.post('/payouts/create', protect, adminOnly, catchAsync(async (req, res) => {
  const { 
    bookingId, 
    providerId, 
    amount, 
    reason, 
    payoutMethod,
    mpesaNumber,
    bankDetails,
    scheduleFor 
  } = req.body;
  
  const Payout = require('../models/Payout');
  const PayoutService = require('../services/payoutService');
  
  // Validate required fields
  if (!providerId || !amount || !reason) {
    return res.status(400).json({
      status: 'error',
      message: 'Provider ID, amount, and reason are required'
    });
  }

  // Validate provider exists
  const provider = await User.findById(providerId);
  if (!provider || provider.userType !== 'provider') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid provider ID'
    });
  }

  // Validate booking if provided
  let booking = null;
  if (bookingId) {
    booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID'
      });
    }
  }

  try {
    // Calculate amounts (admin can override commission rate if needed)
    const commissionRate = req.body.commissionRate || 0.3; // 30% default
    const totalAmount = parseFloat(amount);
    const commissionAmount = totalAmount * commissionRate;
    const payoutAmount = totalAmount - commissionAmount;

    // Set payout schedule
    const serviceCompleted = new Date();
    const payoutScheduled = scheduleFor ? new Date(scheduleFor) : serviceCompleted;

    // Create payout record
    const payout = new Payout({
      booking: bookingId || null,
      provider: providerId,
      client: booking?.client || null,
      status: 'ready', // Admin created payouts are immediately ready
      amounts: {
        totalAmount,
        commissionAmount,
        payoutAmount,
        currency: 'KES'
      },
      timeline: {
        serviceCompleted,
        payoutScheduled
      },
      metadata: {
        bookingReference: booking?.bookingId || `ADMIN-${Date.now()}`,
        serviceTitle: booking?.service?.title || 'Manual Admin Payout',
        providerName: provider.name,
        clientEmail: booking?.client?.email || 'admin-initiated@solutil.com',
        adminInitiated: true,
        adminReason: reason
      },
      activities: [{
        type: 'admin_created',
        description: `Manual payout created by admin ${req.user.name}`,
        reason,
        timestamp: new Date(),
        adminId: req.user._id
      }]
    });

    // Update provider payout details if provided
    if (payoutMethod === 'mpesa' && mpesaNumber) {
      provider.payoutDetails = provider.payoutDetails || {};
      provider.payoutDetails.mpesaNumber = mpesaNumber;
      provider.payoutDetails.preferredMethod = 'mpesa';
      await provider.save();
    } else if (payoutMethod === 'bank' && bankDetails) {
      provider.payoutDetails = provider.payoutDetails || {};
      provider.payoutDetails.bankAccount = bankDetails;
      provider.payoutDetails.preferredMethod = 'bank';
      await provider.save();
    }

    await payout.save();

    // Optionally process immediately if requested
    if (req.body.processImmediately) {
      try {
        const payoutService = new PayoutService();
        const result = await payoutService.processPayout(payout);
        
        payout.activities.push({
          type: 'admin_immediate_process',
          description: `Immediately processed by admin ${req.user.name}`,
          timestamp: new Date(),
          adminId: req.user._id
        });
        await payout.save();
      } catch (processError) {
        // Log error but don't fail the payout creation
        console.error('Failed to immediately process admin payout:', processError);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Manual payout created successfully',
      data: { 
        payout,
        provider: {
          name: provider.name,
          email: provider.email,
          payoutMethod: provider.payoutDetails?.preferredMethod || 'not_set'
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create manual payout: ' + error.message
    });
  }
}));

// @desc    Get provider details for payout creation
// @route   GET /api/admin/providers/:id/payout-info
// @access  Private/Admin
router.get('/providers/:id/payout-info', protect, adminOnly, catchAsync(async (req, res) => {
  const provider = await User.findById(req.params.id);
  
  if (!provider || provider.userType !== 'provider') {
    return res.status(404).json({
      status: 'error',
      message: 'Provider not found'
    });
  }

  // Get provider's recent bookings and payout history
  const recentBookings = await Booking.find({ 
    provider: req.params.id 
  })
  .populate('service', 'title')
  .sort({ createdAt: -1 })
  .limit(5);

  const Payout = require('../models/Payout');
  const payoutHistory = await Payout.find({ 
    provider: req.params.id 
  })
  .sort({ createdAt: -1 })
  .limit(10);

  const payoutStats = await Payout.aggregate([
    { $match: { provider: provider._id } },
    {
      $group: {
        _id: null,
        totalPayouts: { $sum: 1 },
        totalAmount: { $sum: '$amounts.payoutAmount' },
        completedPayouts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      provider: {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        businessName: provider.businessName,
        payoutDetails: provider.payoutDetails || {},
        profilePicture: provider.profilePicture
      },
      recentBookings,
      payoutHistory,
      stats: payoutStats[0] || {
        totalPayouts: 0,
        totalAmount: 0,
        completedPayouts: 0
      }
    }
  });
}));

module.exports = router;
