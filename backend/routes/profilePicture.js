const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary').cloudinary;
const upload = require('../utils/cloudinary').upload;

// Upload profile picture endpoint
router.post('/profile-picture', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Profile picture upload request received');
    console.log('User ID:', req.user.userId);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const userId = req.user.userId;

    // Find the provider
    const provider = await Provider.findById(userId);
    if (!provider) {
      return res.status(404).json({
        status: 'error',
        message: 'Provider not found'
      });
    }

    // If provider has an existing profile picture on Cloudinary, delete it
    if (provider.profilePicture && provider.profilePicture.publicId) {
      try {
        await cloudinary.uploader.destroy(provider.profilePicture.publicId);
        console.log('Old profile picture deleted from Cloudinary');
      } catch (deleteError) {
        console.warn('Failed to delete old profile picture:', deleteError.message);
      }
    }

    // Upload new image to Cloudinary with transformations
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'solutil/profiles',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', format: 'auto' }
          ],
          public_id: `profile_${userId}_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    // Create image data object
    const imageData = {
      url: result.secure_url,
      publicId: result.public_id,
      variants: {
        original: result.secure_url,
        thumbnail: result.secure_url.replace('/upload/', '/upload/c_fill,w_100,h_100/'),
        medium: result.secure_url.replace('/upload/', '/upload/c_fill,w_200,h_200/'),
        large: result.secure_url.replace('/upload/', '/upload/c_fill,w_400,h_400/')
      },
      uploadedAt: new Date()
    };

    // Update provider profile picture
    provider.profilePicture = imageData;
    await provider.save();

    console.log('Profile picture updated successfully for provider:', userId);

    res.json({
      status: 'success',
      message: 'Profile picture updated successfully',
      data: {
        image: imageData,
        provider: {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          profilePicture: imageData
        }
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update profile picture'
    });
  }
});

// Get profile picture endpoint
router.get('/profile-picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const provider = await Provider.findById(userId).select('profilePicture name email');
    if (!provider) {
      return res.status(404).json({
        status: 'error',
        message: 'Provider not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        profilePicture: provider.profilePicture,
        name: provider.name,
        email: provider.email
      }
    });

  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile picture'
    });
  }
});

module.exports = router;