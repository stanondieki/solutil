const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// @desc    Update provider documents
// @route   POST /api/users/update-documents
// @access  Private
router.post('/update-documents', catchAsync(async (req, res, next) => {
  const { userId, documentType, documentUrl, filename } = req.body;
  
  console.log('Received document update request:', { userId, documentType, documentUrl, filename });

  const user = await User.findById(userId);
  if (!user) {
    console.log('User not found:', userId);
    return next(new AppError('User not found', 404));
  }

  if (user.userType !== 'provider') {
    console.log('User is not a provider:', user.userType);
    return next(new AppError('User is not a provider', 400));
  }

  // Update the specific document
  const updatePath = `providerDocuments.${documentType}`;
  const updateData = {
    [`${updatePath}.url`]: documentUrl,
    [`${updatePath}.uploaded`]: new Date(),
    [`${updatePath}.verified`]: false
  };

  if (filename) {
    updateData[`${updatePath}.public_id`] = filename;
  }

  console.log('Updating user with data:', updateData);
  await User.findByIdAndUpdate(userId, updateData);

  console.log('Document update successful for:', documentType);
  res.status(200).json({
    status: 'success',
    message: 'Document updated successfully'
  });
}));

// Placeholder routes - to be implemented
router.get('/', protect, (req, res) => {
  res.json({ message: 'Users route - Coming soon' });
});

router.get('/providers', protect, (req, res) => {
  res.json({ message: 'Providers route - Coming soon' });
});

router.get('/reviews', protect, (req, res) => {
  res.json({ message: 'Reviews route - Coming soon' });
});

router.get('/payments', protect, (req, res) => {
  res.json({ message: 'Payments route - Coming soon' });
});

router.get('/upload', protect, (req, res) => {
  res.json({ message: 'Upload route - Coming soon' });
});

module.exports = router;
