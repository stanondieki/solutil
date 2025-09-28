const express = require('express');
const { uploadMiddleware, deleteFromCloudinary, getImageVariants } = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Upload profile picture
// @route   POST /api/upload/profile-picture
// @access  Private
router.post('/profile-picture', 
  uploadMiddleware.profilePicture,
  catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      variants: getImageVariants(req.file.filename)
    };

    logger.info(`Profile picture uploaded for user ${req.user.email}`, {
      publicId: req.file.filename,
      url: req.file.path
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile picture uploaded successfully',
      data: {
        image: imageData
      }
    });
  })
);

// @desc    Upload service images (multiple)
// @route   POST /api/upload/service-images
// @access  Private (Provider only)
router.post('/service-images',
  (req, res, next) => {
    if (req.user.userType !== 'provider') {
      return next(new AppError('Access denied. Provider privileges required.', 403));
    }
    next();
  },
  uploadMiddleware.serviceImages,
  catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      variants: getImageVariants(file.filename)
    }));

    logger.info(`${req.files.length} service images uploaded for provider ${req.user.email}`, {
      imageCount: req.files.length,
      publicIds: req.files.map(f => f.filename)
    });

    res.status(200).json({
      status: 'success',
      message: `${req.files.length} images uploaded successfully`,
      data: {
        images: uploadedImages
      }
    });
  })
);

// @desc    Upload single service image
// @route   POST /api/upload/service-image
// @access  Private (Provider only)
router.post('/service-image',
  (req, res, next) => {
    if (req.user.userType !== 'provider') {
      return next(new AppError('Access denied. Provider privileges required.', 403));
    }
    next();
  },
  uploadMiddleware.singleServiceImage,
  catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      variants: getImageVariants(req.file.filename)
    };

    logger.info(`Service image uploaded for provider ${req.user.email}`, {
      publicId: req.file.filename,
      url: req.file.path
    });

    res.status(200).json({
      status: 'success',
      message: 'Service image uploaded successfully',
      data: {
        image: imageData
      }
    });
  })
);

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId',
  catchAsync(async (req, res, next) => {
    const { publicId } = req.params;

    if (!publicId) {
      return next(new AppError('Public ID is required', 400));
    }

    try {
      const result = await deleteFromCloudinary(publicId);
      
      if (result.result === 'ok') {
        logger.info(`Image deleted from Cloudinary by user ${req.user.email}`, {
          publicId,
          deletionResult: result
        });

        res.status(200).json({
          status: 'success',
          message: 'Image deleted successfully'
        });
      } else {
        return next(new AppError('Failed to delete image', 400));
      }
    } catch (error) {
      logger.error(`Failed to delete image from Cloudinary: ${error.message}`, {
        publicId,
        userId: req.user.id,
        error: error.message
      });
      return next(new AppError('Failed to delete image', 500));
    }
  })
);

module.exports = router;
