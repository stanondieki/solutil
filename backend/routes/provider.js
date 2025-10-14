const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');
const providerEmailTemplates = require('../utils/providerEmailTemplates');

// Try to use Cloudinary first, fallback to local uploads
let uploadMiddleware, transformFileData, getFileUrl;

try {
  // Check if Cloudinary is configured
  const cloudinaryConfig = require('../utils/cloudinary');
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key') {
    uploadMiddleware = cloudinaryConfig.uploadMiddleware;
    console.log('✅ Using Cloudinary for uploads');
  } else {
    throw new Error('Cloudinary not configured');
  }
} catch (error) {
  console.log('⚠️ Cloudinary not available, using local uploads:', error.message);
  const localUpload = require('../utils/localUpload');
  uploadMiddleware = localUpload.uploadMiddleware;
  transformFileData = localUpload.transformFileData;
  getFileUrl = localUpload.getFileUrl;
}

const router = express.Router();

// @desc    Upload provider document
// @route   POST /api/provider/upload-document
// @access  Private (Providers only)
router.post('/upload-document', protect, (req, res, next) => {
  // Add debugging for upload middleware
  console.log('🔍 Upload middleware starting...');
  console.log('Request body before middleware:', req.body);
  console.log('Request headers:', req.headers);
  
  uploadMiddleware.providerDocuments(req, res, (err) => {
    if (err) {
      console.error('❌ Upload middleware error:', err);
      return next(new AppError(`Upload failed: ${err.message}`, 400));
    }
    
    console.log('✅ Upload middleware completed');
    console.log('Request file after middleware:', req.file);
    console.log('Request body after middleware:', req.body);
    next();
  });
}, catchAsync(async (req, res, next) => {
  console.log('🚀 Document upload handler starting...');
  
  // Check if user is a provider
  if (req.user.userType !== 'provider') {
    return next(new AppError('Only providers can upload documents', 403));
  }

  const { documentType } = req.body;
  const allowedDocTypes = ['nationalId', 'businessLicense', 'certificate', 'goodConductCertificate'];
  
  console.log('📋 Document type:', documentType);
  console.log('📋 Allowed types:', allowedDocTypes);
  
  if (!allowedDocTypes.includes(documentType)) {
    return next(new AppError('Invalid document type', 400));
  }

  if (!req.file) {
    console.error('❌ No file in request:', req.file);
    return next(new AppError('No file uploaded', 400));
  }

  console.log('📎 File received:', {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  });

  try {
    // Transform file data for local uploads if needed
    let fileData = req.file;
    if (transformFileData) {
      fileData = transformFileData(req, req.file);
    }

    // Update user document in database with upload data
    const updateField = `providerDocuments.${documentType}`;
    const documentData = {
      url: fileData.path || fileData.secure_url, // File URL
      secure_url: fileData.path || fileData.secure_url, // Also store as secure_url for consistency
      public_id: fileData.filename || fileData.public_id, // File identifier
      originalName: fileData.originalname,
      mimetype: fileData.mimetype,
      size: fileData.size,
      uploaded: new Date(),
      verified: false
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { [updateField]: documentData }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    logger.info(`Document uploaded: ${documentType} for user ${user.email} - ${fileData.filename || fileData.public_id}`);

    res.status(200).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: {
        documentType,
        url: documentData.url,
        secure_url: documentData.secure_url,
        public_id: documentData.public_id,
        originalName: documentData.originalName,
        uploaded: documentData.uploaded
      }
    });
  } catch (error) {
    logger.error(`Document upload failed: ${error.message}`);
    throw error;
  }
}));

// @desc    Update provider profile
// @route   PUT /api/provider/profile
// @access  Private (Providers only)
router.put('/profile', protect, catchAsync(async (req, res, next) => {
  // Check if user is a provider
  if (req.user.userType !== 'provider') {
    return next(new AppError('Only providers can update provider profile', 403));
  }

  const { 
    experience, 
    skills, 
    hourlyRate, 
    availability, 
    serviceAreas, 
    bio, 
    services, 
    profilePhoto, 
    homeAddress, 
    phoneNumber, 
    emergencyContact, 
    languages, 
    professionalMemberships, 
    paymentInfo,
    materialSourcing,
    policies,
    rateStructure,
    portfolio
  } = req.body;

    // Validation
  if (!experience || !skills || !hourlyRate || !serviceAreas || !bio || !availability || !homeAddress || !phoneNumber || !emergencyContact || !languages || !paymentInfo) {
    return next(new AppError('All profile fields are required', 400));
  }

  // Validate home address
  if (!homeAddress.street || !homeAddress.area) {
    return next(new AppError('Street address and area are required', 400));
  }

  // Validate phone number
  if (!phoneNumber.trim()) {
    return next(new AppError('Phone number is required', 400));
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return next(new AppError('At least one skill is required', 400));
  }

  if (!Array.isArray(serviceAreas) || serviceAreas.length === 0) {
    return next(new AppError('At least one service area is required', 400));
  }

  if (!availability.days || !Array.isArray(availability.days) || availability.days.length === 0) {
    return next(new AppError('At least one available day is required', 400));
  }

  if (isNaN(hourlyRate) || hourlyRate <= 0) {
    return next(new AppError('Valid hourly rate is required', 400));
  }

  if (bio.length > 500) {
    return next(new AppError('Bio cannot exceed 500 characters', 400));
  }

  try {
    // Prepare update data
    const updateData = {
      'providerProfile.experience': experience,
      'providerProfile.skills': skills,
      'providerProfile.hourlyRate': parseFloat(hourlyRate),
      'providerProfile.availability': availability,
      'providerProfile.serviceAreas': serviceAreas,
      'providerProfile.bio': bio,
      'providerProfile.homeAddress': homeAddress,
      'providerProfile.emergencyContact': emergencyContact,
      'providerProfile.languages': languages,
      'providerProfile.professionalMemberships': professionalMemberships,
      'providerProfile.paymentInfo': paymentInfo,
      'providerProfile.materialSourcing': materialSourcing,
      'providerProfile.policies': policies,
      'providerProfile.rateStructure': rateStructure,
      'providerProfile.portfolio': portfolio,
      'phone': phoneNumber
    };

    // Include services if provided (from onboarding)
    if (services && Array.isArray(services) && services.length > 0) {
      updateData['providerProfile.services'] = services;
    }

    // Include profile photo if provided (from onboarding)
    if (profilePhoto && profilePhoto.url) {
      updateData['profilePicture'] = profilePhoto.url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    logger.info(`Provider profile updated for user ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        providerProfile: user.providerProfile
      }
    });
  } catch (error) {
    logger.error('Error updating provider profile:', error);
    return next(new AppError('Failed to update profile', 500));
  }
}));

// @desc    Submit provider application for review
// @route   POST /api/provider/submit-application
// @access  Private (Providers only)
router.post('/submit-application', protect, catchAsync(async (req, res, next) => {
  // Check if user is a provider
  if (req.user.userType !== 'provider') {
    return next(new AppError('Only providers can submit applications', 403));
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if resubmission is allowed based on current status
  if (user.providerStatus === 'under_review') {
    return next(new AppError('Your application is already under review. Please wait for the admin decision before resubmitting.', 409));
  }

  if (user.providerStatus === 'approved') {
    return next(new AppError('Your provider application has already been approved. No need to resubmit.', 409));
  }

  // Check if all required documents are uploaded
  const requiredDocs = ['nationalId', 'businessLicense', 'certificate', 'goodConductCertificate'];
  const missingDocs = requiredDocs.filter(doc => 
    !user.providerDocuments[doc] || !user.providerDocuments[doc].url
  );

  if (missingDocs.length > 0) {
    return next(new AppError(`Missing required documents: ${missingDocs.join(', ')}`, 400));
  }

  // Check if profile is complete
  const profile = user.providerProfile;
  if (!profile.experience || !profile.skills?.length || !profile.hourlyRate || 
      !profile.serviceAreas?.length || !profile.bio || !profile.availability?.days?.length) {
    return next(new AppError('Please complete your profile before submitting', 400));
  }

  // Update provider status to under_review and track submission
  const previousStatus = user.providerStatus;
  user.providerStatus = 'under_review';
  user.submittedAt = new Date();
  
  // If this is a resubmission after rejection, clear the rejection reason
  if (previousStatus === 'rejected') {
    user.rejectionReason = undefined;
    user.rejectedAt = undefined;
  }
  
  await user.save();

  logger.info(`Application ${previousStatus === 'rejected' ? 're' : ''}submitted for review: ${user.email}`);

  // Send confirmation email to provider
  try {
    const template = providerEmailTemplates.applicationSubmitted;
    await sendEmail({
      email: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    logger.info(`Application submitted email sent to ${user.email}`);
  } catch (error) {
    logger.error('Error sending application submitted email:', error);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    status: 'success',
    message: 'Application submitted successfully for review',
    data: {
      providerStatus: user.providerStatus
    }
  });
}));

// @desc    Get provider profile and documents status
// @route   GET /api/provider/profile
// @access  Private (Providers only)
router.get('/profile', protect, catchAsync(async (req, res, next) => {
  // Check if user is a provider
  if (req.user.userType !== 'provider') {
    return next(new AppError('Only providers can access provider profile', 403));
  }

  const user = await User.findById(req.user._id)
    .select('providerProfile providerDocuments providerStatus approvedAt rejectedAt submittedAt rejectionReason');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Calculate completion percentage
  const documentsUploaded = Object.values(user.providerDocuments || {})
    .filter(doc => doc && doc.url).length;
  const totalDocuments = 4; // nationalId, businessLicense, certificate, goodConductCertificate

  const profileFields = [
    user.providerProfile?.experience,
    user.providerProfile?.skills?.length,
    user.providerProfile?.hourlyRate,
    user.providerProfile?.serviceAreas?.length,
    user.providerProfile?.bio,
    user.providerProfile?.availability?.days?.length
  ];
  const profileCompleted = profileFields.filter(field => field).length;
  const totalProfileFields = profileFields.length;

  const completionPercentage = Math.round(
    ((documentsUploaded / totalDocuments) * 50) + 
    ((profileCompleted / totalProfileFields) * 50)
  );

  res.status(200).json({
    status: 'success',
    data: {
      profile: user.providerProfile,
      documents: user.providerDocuments,
      providerStatus: user.providerStatus,
      approvedAt: user.approvedAt,
      rejectedAt: user.rejectedAt,
      submittedAt: user.submittedAt,
      rejectionReason: user.rejectionReason,
      completionPercentage,
      documentsUploaded,
      totalDocuments,
      profileCompleted,
      totalProfileFields
    }
  });
}));

// @desc    Get provider documents
// @route   GET /api/provider/documents/:documentType
// @access  Private (Providers only)
router.get('/documents/:documentType', protect, catchAsync(async (req, res, next) => {
  // Check if user is a provider
  if (req.user.userType !== 'provider') {
    return next(new AppError('Only providers can access documents', 403));
  }

  const { documentType } = req.params;
  const allowedDocTypes = ['nationalId', 'businessLicense', 'certificate', 'goodConductCertificate'];
  
  if (!allowedDocTypes.includes(documentType)) {
    return next(new AppError('Invalid document type', 400));
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const document = user.providerDocuments?.[documentType];
  
  if (!document || !document.url) {
    return next(new AppError('Document not found', 404));
  }

  const filePath = path.join(__dirname, '../uploads/documents', document.public_id);
  
  if (!fs.existsSync(filePath)) {
    return next(new AppError('Document file not found', 404));
  }

  res.sendFile(filePath);
}));

// @desc    Upload provider profile picture
// @route   POST /api/provider/profile-picture
// @access  Private (Providers only)
router.post('/profile-picture', protect, (req, res, next) => {
  console.log('🔍 Profile picture upload starting...');
  console.log('Request body before middleware:', req.body);
  
  uploadMiddleware.profilePicture(req, res, (err) => {
    if (err) {
      console.error('❌ Profile picture upload middleware error:', err);
      return next(new AppError(`Upload failed: ${err.message}`, 400));
    }
    
    console.log('✅ Profile picture upload middleware completed');
    console.log('Request file after middleware:', req.file);
    next();
  });
}, catchAsync(async (req, res, next) => {
  console.log('🚀 Profile picture upload handler starting...');
  
  // Check if user is a provider
  if (req.user.userType !== 'provider') {
    return next(new AppError('Only providers can upload profile pictures', 403));
  }

  if (!req.file) {
    return next(new AppError('No image file provided', 400));
  }

  const userId = req.user._id;

  // Find the provider
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update user avatar with Cloudinary URL (matches User model schema exactly)
  const avatarData = {
    public_id: req.file.filename, // Cloudinary public_id 
    url: req.file.path // Cloudinary secure_url
  };

  user.avatar = avatarData;
  await user.save();

  console.log('✅ Profile picture updated successfully for user:', userId);

  res.status(200).json({
    status: 'success',
    message: 'Profile picture updated successfully',
    data: {
      image: avatarData,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: avatarData
      }
    }
  });
}));

// @desc    Get provider profile picture
// @route   GET /api/provider/profile-picture
// @access  Private (Providers only)
router.get('/profile-picture', protect, catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  const user = await User.findById(userId).select('avatar name email');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      avatar: user.avatar,
      name: user.name,
      email: user.email
    }
  });
}));

module.exports = router;