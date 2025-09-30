const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    .select('name email profilePicture providerProfile providerStatus createdAt')
    .sort({ 'providerProfile.rating': -1, createdAt: -1 });

  // Apply limit
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  
  query = query.limit(limitNum).skip((pageNum - 1) * limitNum);

  const providers = await query;
  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: providers.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: {
      providers
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

module.exports = router;
