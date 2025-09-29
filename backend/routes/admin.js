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
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Import admin sub-routes
const adminProviderRoutes = require('./admin/providers');
const adminEmailRoutes = require('./admin/email');

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

    // Build filter query
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      // Search in customer name, provider name, or booking ID
      filter.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'provider.name': { $regex: search, $options: 'i' } },
        { bookingNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch bookings with populated references
    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Booking.countDocuments(filter);

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
    ).populate('customer', 'name email')
     .populate('provider', 'name email')
     .populate('service', 'name');

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

module.exports = router;
