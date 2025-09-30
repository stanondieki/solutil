const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, catchAsync(async (req, res) => {
  const user = req.user;
  let stats = {};

  try {
    if (user.userType === 'client') {
      // Client dashboard stats - for now return zero values as we build out the booking system
      stats = {
        totalBookings: 0,
        favoriteServices: 0,
        totalSpent: 0,
        reviewsGiven: 0,
        bookingsTrend: 'Start booking services',
        favoritesTrend: 'Save your favorite services',
        spendingTrend: 'No spending yet',
        reviewsTrend: 'Book services to leave reviews'
      };

    } else if (user.userType === 'provider') {
      if (user.providerStatus !== 'approved') {
        // Provider setup stats
        const documentsUploaded = Object.values(user.providerDocuments || {})
          .filter(doc => doc && doc.url).length;
        
        const profileFields = [
          user.providerProfile?.experience,
          user.providerProfile?.skills?.length,
          user.providerProfile?.hourlyRate,
          user.providerProfile?.serviceAreas?.length,
          user.providerProfile?.bio,
          user.providerProfile?.availability?.days?.length
        ];
        const profileCompleted = profileFields.filter(field => field).length;
        const profileCompletion = Math.round((profileCompleted / profileFields.length) * 100);

        stats = {
          documentsUploaded,
          profileCompletion,
          applicationStatus: user.providerStatus || 'pending'
        };
      } else {
        // Approved provider stats - for now return zero values as we build out the booking system
        stats = {
          totalBookings: 0,
          monthlyEarnings: 0,
          averageRating: 0.0,
          activeServices: 0,
          bookingsTrend: 'Start receiving bookings',
          earningsTrend: 'Complete bookings to earn',
          ratingTrend: 'Get rated by customers',
          servicesTrend: 'Add your services'
        };
      }

    } else if (user.userType === 'admin') {
      // Admin dashboard stats
      const totalUsers = await User.countDocuments();
      const activeProviders = await User.countDocuments({ 
        userType: 'provider', 
        providerStatus: 'approved' 
      });
      const pendingProviders = await User.countDocuments({ 
        userType: 'provider', 
        providerStatus: 'under_review' 
      });

      stats = {
        totalUsers,
        activeProviders,
        totalRevenue: 0, // Will be calculated from actual bookings later
        pendingReviews: pendingProviders, // For now, use pending provider applications
        usersTrend: `${totalUsers} total users`,
        providersTrend: `${activeProviders} active providers`,
        revenueTrend: 'Revenue tracking coming soon',
        reviewsTrend: `${pendingProviders} providers pending review`
      };
    }

    res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
}));

module.exports = router;