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

const router = express.Router();

// Middleware to check admin role
const adminOnly = catchAsync(async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
  next();
});

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

module.exports = router;
