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
      // Client dashboard stats - get real booking data
      const Booking = require('../models/Booking');
      
      // Get client's bookings
      const clientBookings = await Booking.find({ client: user.id });
      const totalBookings = clientBookings.length;
      
      // Calculate total spent (sum of completed bookings)
      const completedBookings = clientBookings.filter(b => b.status === 'completed');
      const totalSpent = completedBookings.reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);
      
      // Calculate reviews given (bookings with ratings)
      const reviewsGiven = clientBookings.filter(b => b.rating && b.rating > 0).length;
      
      stats = {
        totalBookings,
        favoriteServices: 0, // TODO: Implement favorites system
        totalSpent,
        reviewsGiven,
        bookingsTrend: totalBookings > 0 ? `${totalBookings} booking${totalBookings > 1 ? 's' : ''} completed` : 'Start booking services',
        favoritesTrend: 'Save your favorite services',
        spendingTrend: totalSpent > 0 ? `KES ${totalSpent.toLocaleString()} spent` : 'No spending yet',
        reviewsTrend: reviewsGiven > 0 ? `${reviewsGiven} review${reviewsGiven > 1 ? 's' : ''} given` : 'Book services to leave reviews'
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
        // Approved provider stats - get real booking data
        const Booking = require('../models/Booking');
        const Service = require('../models/Service');
        
        // Get provider's bookings
        const providerBookings = await Booking.find({ provider: user.id });
        const totalBookings = providerBookings.length;
        
        // Calculate monthly earnings (current month)
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const monthlyBookings = providerBookings.filter(b => 
          b.status === 'completed' && 
          new Date(b.createdAt) >= currentMonth
        );
        const monthlyEarnings = monthlyBookings.reduce((sum, booking) => 
          sum + (booking.pricing?.totalAmount || 0), 0
        );
        
        // Calculate average rating
        const ratedBookings = providerBookings.filter(b => b.rating && b.rating > 0);
        const averageRating = ratedBookings.length > 0 
          ? ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length 
          : 0;
        
        // Count active services
        const activeServices = await Service.countDocuments({ providerId: user.id });

        stats = {
          totalBookings,
          monthlyEarnings,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          activeServices,
          bookingsTrend: totalBookings > 0 ? `${totalBookings} booking${totalBookings > 1 ? 's' : ''} received` : 'Start receiving bookings',
          earningsTrend: monthlyEarnings > 0 ? `KES ${monthlyEarnings.toLocaleString()} this month` : 'Complete bookings to earn',
          ratingTrend: ratedBookings.length > 0 ? `${averageRating.toFixed(1)}/5 average rating` : 'Get rated by customers',
          servicesTrend: activeServices > 0 ? `${activeServices} service${activeServices > 1 ? 's' : ''} active` : 'Add your services'
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