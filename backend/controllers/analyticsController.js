const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// @desc    Get provider analytics dashboard
// @route   GET /api/analytics/provider
// @access  Private (Provider only)
exports.getProviderAnalytics = catchAsync(async (req, res, next) => {
  const providerId = req.user._id;
  const { period = '30' } = req.query; // days
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get booking statistics
  const bookingStats = await Booking.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(providerId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' }
      }
    }
  ]);

  // Get completion rate over time
  const completionTrend = await Booking.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(providerId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        revenue: { $sum: '$pricing.totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Get average ratings over time
  const ratingTrend = await Review.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(providerId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          week: { $week: '$createdAt' }
        },
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.week': 1 }
    }
  ]);

  // Get service performance
  const servicePerformance = await Booking.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(providerId),
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceInfo'
      }
    },
    {
      $lookup: {
        from: 'providerservices', 
        localField: 'service',
        foreignField: '_id',
        as: 'providerServiceInfo'
      }
    },
    {
      $group: {
        _id: '$service',
        serviceName: { $first: { $ifNull: [{ $arrayElemAt: ['$serviceInfo.title', 0] }, { $arrayElemAt: ['$providerServiceInfo.title', 0] }] } },
        category: { $first: { $ifNull: [{ $arrayElemAt: ['$serviceInfo.category', 0] }, { $arrayElemAt: ['$providerServiceInfo.category', 0] }] } },
        bookingCount: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageRevenue: { $avg: '$pricing.totalAmount' }
      }
    },
    {
      $sort: { bookingCount: -1 }
    }
  ]);

  // Get recent reviews
  const recentReviews = await Review.find({ provider: providerId })
    .populate('reviewer', 'name')
    .populate('service', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate summary metrics
  const totalBookings = bookingStats.reduce((sum, stat) => sum + stat.count, 0);
  const completedBookings = bookingStats.find(stat => stat._id === 'completed')?.count || 0;
  const totalRevenue = bookingStats.reduce((sum, stat) => sum + (stat.revenue || 0), 0);
  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  // Get provider's overall rating
  const providerStats = await Review.aggregate([
    {
      $match: { provider: new mongoose.Types.ObjectId(providerId) }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const overallRating = providerStats[0]?.averageRating || 0;
  const totalReviews = providerStats[0]?.totalReviews || 0;

  // Calculate rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
    const count = providerStats[0]?.ratingDistribution?.filter(r => Math.floor(r) === rating).length || 0;
    return { rating, count, percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0 };
  });

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalBookings,
        completedBookings,
        completionRate,
        totalRevenue,
        overallRating: Math.round(overallRating * 10) / 10,
        totalReviews
      },
      trends: {
        completion: completionTrend,
        ratings: ratingTrend
      },
      servicePerformance,
      ratingDistribution,
      recentReviews,
      bookingsByStatus: bookingStats
    }
  });
});

// @desc    Get admin analytics dashboard
// @route   GET /api/analytics/admin
// @access  Private (Admin only)
exports.getAdminAnalytics = catchAsync(async (req, res, next) => {
  const { period = '30' } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Platform statistics
  const platformStats = await Booking.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        avgBookingValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);

  // Provider performance
  const topProviders = await Booking.aggregate([
    {
      $match: { 
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$provider',
        bookingCount: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'providerInfo'
      }
    },
    {
      $project: {
        providerName: { $arrayElemAt: ['$providerInfo.name', 0] },
        bookingCount: 1,
        totalRevenue: 1
      }
    },
    {
      $sort: { bookingCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Service category performance
  const categoryStats = await Booking.aggregate([
    {
      $match: { 
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceInfo'
      }
    },
    {
      $lookup: {
        from: 'providerservices',
        localField: 'service', 
        foreignField: '_id',
        as: 'providerServiceInfo'
      }
    },
    {
      $group: {
        _id: { 
          $ifNull: [
            { $arrayElemAt: ['$serviceInfo.category', 0] },
            { $arrayElemAt: ['$providerServiceInfo.category', 0] }
          ]
        },
        bookingCount: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' }
      }
    },
    {
      $sort: { bookingCount: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      platformStats: platformStats[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 },
      topProviders,
      categoryStats
    }
  });
});

// @desc    Get booking analytics for specific timeframe
// @route   GET /api/analytics/bookings
// @access  Private
exports.getBookingAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  const userId = req.user._id;
  const userRole = req.user.userType;

  let matchQuery = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  // Filter by user role
  if (userRole === 'provider') {
    matchQuery.provider = new mongoose.Types.ObjectId(userId);
  } else if (userRole !== 'admin') {
    matchQuery.client = new mongoose.Types.ObjectId(userId);
  }

  let groupByQuery;
  switch (groupBy) {
    case 'hour':
      groupByQuery = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      };
      break;
    case 'week':
      groupByQuery = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'month':
      groupByQuery = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default: // day
      groupByQuery = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const analytics = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: groupByQuery,
        bookingCount: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledCount: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: { analytics }
  });
});

module.exports = {
  getProviderAnalytics: exports.getProviderAnalytics,
  getAdminAnalytics: exports.getAdminAnalytics,
  getBookingAnalytics: exports.getBookingAnalytics
};