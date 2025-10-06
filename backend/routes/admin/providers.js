const express = require('express');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const logger = require('../../utils/logger');
const ProviderServiceManager = require('../../utils/providerServiceManager');

const router = express.Router();

// @desc    Update provider status
// @route   PUT /api/admin/providers/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const { status } = req.body;
  const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'suspended'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status provided', 400));
  }

  const provider = await User.findById(req.params.id);
  
  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (provider.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  // Update provider status
  provider.providerStatus = status;
  
  // Set approval/rejection timestamps
  if (status === 'approved') {
    provider.approvedBy = req.user._id;
    provider.approvedAt = new Date();
    
    // 🆕 AUTO-ACTIVATE PROVIDER SERVICES
    try {
      const activatedServices = await ProviderServiceManager.activateProviderServices(provider);
      logger.info(`✅ Auto-activated ${activatedServices.length} services for provider: ${provider.email}`);
    } catch (serviceError) {
      logger.error(`❌ Failed to activate services for ${provider.email}:`, serviceError);
      // Don't fail the approval if service activation fails
    }
  } else if (status === 'rejected') {
    provider.rejectedAt = new Date();
  }

  await provider.save();

  logger.info(`Provider ${provider.email} status updated to ${status} by admin ${req.user.email}`);

  // Send email notification to provider about status change
  try {
    const { sendEmail } = require('../../utils/email');
    const providerEmailTemplates = require('../../utils/providerEmailTemplates');
    
    let template = null;
    let emailData = {};

    if (status === 'approved') {
      template = providerEmailTemplates.approved;
      emailData.dashboardUrl = `${process.env.CLIENT_URL}/dashboard`;
    } else if (status === 'rejected') {
      template = providerEmailTemplates.rejected;
      emailData.reapplyUrl = `${process.env.CLIENT_URL}/provider/onboarding`;
    }

    if (template) {
      let htmlContent = template.html;
      let textContent = template.text;
      
      // Replace template variables
      Object.keys(emailData).forEach(key => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), emailData[key]);
        textContent = textContent.replace(new RegExp(placeholder, 'g'), emailData[key]);
      });

      await sendEmail({
        email: provider.email,
        subject: template.subject,
        html: htmlContent,
        text: textContent
      });
      
      logger.info(`Provider status change email sent to ${provider.email}`);
    }
  } catch (error) {
    logger.error('Error sending provider status change email:', error);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    status: 'success',
    message: 'Provider status updated successfully',
    data: {
      providerId: provider._id,
      providerStatus: provider.providerStatus,
      approvedAt: provider.approvedAt,
      rejectedAt: provider.rejectedAt
    }
  });
}));

// @desc    Verify provider document
// @route   PUT /api/admin/providers/:id/documents/:documentType/verify
// @access  Private (Admin only)
router.put('/:id/documents/:documentType/verify', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const { verified } = req.body;
  const { documentType } = req.params;
  
  const validDocTypes = ['nationalId', 'businessLicense', 'certificate', 'goodConductCertificate'];
  
  if (!validDocTypes.includes(documentType)) {
    return next(new AppError('Invalid document type', 400));
  }

  if (typeof verified !== 'boolean') {
    return next(new AppError('Verified field must be a boolean', 400));
  }

  const provider = await User.findById(req.params.id);
  
  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (provider.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  // Check if document exists
  if (!provider.providerDocuments || !provider.providerDocuments[documentType]) {
    return next(new AppError('Document not found', 404));
  }

  // Update document verification status
  provider.providerDocuments[documentType].verified = verified;
  await provider.save();

  logger.info(`Document ${documentType} for provider ${provider.email} ${verified ? 'verified' : 'unverified'} by admin ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    message: `Document ${verified ? 'verified' : 'unverified'} successfully`,
    data: {
      providerId: provider._id,
      documentType,
      verified
    }
  });
}));

// @desc    Get provider details
// @route   GET /api/admin/providers/:id
// @access  Private (Admin only)
router.get('/:id', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const provider = await User.findById(req.params.id)
    .populate('approvedBy', 'name email')
    .select('-password');
  
  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (provider.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      provider
    }
  });
}));

// @desc    Get all providers with filtering
// @route   GET /api/admin/providers
// @access  Private (Admin only)
router.get('/', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const { status, verified, skills, location, limit = 50, page = 1 } = req.query;

  // Build filter query
  let query = { userType: 'provider' };
  
  if (status) {
    query.providerStatus = status;
  }

  if (skills) {
    query['providerProfile.skills'] = { $in: skills.split(',') };
  }

  if (location) {
    query['address.city'] = new RegExp(location, 'i');
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const providers = await User.find(query)
    .select('-password')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: providers.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: {
      providers
    }
  });
}));

// @desc    Update provider profile information
// @route   PUT /api/admin/providers/:id/profile
// @access  Private (Admin only)
router.put('/:id/profile', protect, catchAsync(async (req, res, next) => {
  logger.info(`🔄 Admin ${req.user.email} updating provider profile ${req.params.id}`);
  logger.info(`📝 Request body: ${JSON.stringify(req.body, null, 2)}`);
  
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    logger.error(`❌ Access denied for user ${req.user.email} - not admin`);
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const {
    name,
    email,
    phone,
    address,
    providerProfile,
    adminNote
  } = req.body;

  const provider = await User.findById(req.params.id);
  
  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (provider.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  // Update basic information
  if (name !== undefined) provider.name = name;
  if (email !== undefined) provider.email = email;
  if (phone !== undefined) provider.phone = phone;
  
  // Update address
  if (address) {
    provider.address = {
      ...provider.address,
      ...address
    };
  }

  // Update provider profile
  if (providerProfile) {
    provider.providerProfile = {
      ...provider.providerProfile,
      ...providerProfile
    };
  }

  // Add admin note if provided
  if (adminNote && adminNote.trim()) {
    // Ensure adminNotes array exists
    if (!provider.adminNotes) {
      provider.adminNotes = [];
    }
    provider.adminNotes.push({
      note: adminNote.trim(),
      admin: req.user._id,
      type: 'profile_update',
      date: new Date()
    });
  }

  try {
    await provider.save();
    logger.info(`✅ Provider profile updated successfully for ${provider.email} by admin ${req.user.email}`);
  } catch (saveError) {
    logger.error(`❌ Failed to save provider ${provider.email}:`, saveError);
    return next(new AppError(`Failed to save provider: ${saveError.message}`, 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Provider profile updated successfully',
    data: {
      provider: {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
        providerProfile: provider.providerProfile,
        providerStatus: provider.providerStatus
      }
    }
  });
}));

// @desc    Add admin note to provider
// @route   POST /api/admin/providers/:id/notes
// @access  Private (Admin only)
router.post('/:id/notes', protect, catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  const { note, type = 'general' } = req.body;
  
  if (!note || note.trim().length === 0) {
    return next(new AppError('Note content is required', 400));
  }

  const validTypes = ['approval', 'rejection', 'warning', 'general'];
  if (!validTypes.includes(type)) {
    return next(new AppError('Invalid note type', 400));
  }

  const provider = await User.findById(req.params.id);
  
  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (provider.userType !== 'provider') {
    return next(new AppError('User is not a provider', 400));
  }

  // Add admin note
  provider.adminNotes.push({
    note: note.trim(),
    admin: req.user._id,
    type,
    date: new Date()
  });

  await provider.save();

  logger.info(`Admin note added to provider ${provider.email} by admin ${req.user.email}`);

  res.status(201).json({
    status: 'success',
    message: 'Admin note added successfully',
    data: {
      note: provider.adminNotes[provider.adminNotes.length - 1]
    }
  });
}));

module.exports = router;