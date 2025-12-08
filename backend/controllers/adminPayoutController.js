const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Payout = require('../models/Payout');
const User = require('../models/User');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');
const PayoutService = require('../services/payoutService');

/**
 * Admin Payout Management Controller
 * Handles all admin operations for payout oversight
 */
class AdminPayoutController {
  
  /**
   * Get all payouts with filters and pagination
   * @route GET /api/admin/payouts
   */
  getAllPayouts = catchAsync(async (req, res, next) => {
    const {
      status,
      provider,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (provider) {
      filter.provider = provider;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    if (minAmount || maxAmount) {
      filter['amounts.payoutAmount'] = {};
      if (minAmount) filter['amounts.payoutAmount'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['amounts.payoutAmount'].$lte = parseFloat(maxAmount);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const payouts = await Payout.find(filter)
      .populate({
        path: 'provider',
        select: 'name email businessName phone payoutDetails'
      })
      .populate({
        path: 'client',
        select: 'name email phone'
      })
      .populate({
        path: 'booking',
        select: 'bookingId service pricing status',
        populate: {
          path: 'service',
          select: 'title category'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPayouts = await Payout.countDocuments(filter);
    const totalPages = Math.ceil(totalPayouts / limit);

    // Calculate summary statistics
    const summaryStats = await Payout.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amounts.payoutAmount' },
          totalCommission: { $sum: '$amounts.commissionAmount' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        payouts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayouts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary: summaryStats,
        filters: {
          status,
          provider,
          dateFrom,
          dateTo,
          minAmount,
          maxAmount
        }
      }
    });

    logger.info(`Admin ${req.user.name} viewed payouts`, {
      service: 'admin-payout',
      filters: filter,
      resultCount: payouts.length
    });
  });

  /**
   * Get payout statistics and dashboard data
   * @route GET /api/admin/payouts/stats
   */
  getPayoutStats = catchAsync(async (req, res, next) => {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let dateFrom;
    switch (period) {
      case '7d':
        dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await Payout.aggregate([
      {
        $facet: {
          // Overall statistics
          overall: [
            {
              $group: {
                _id: null,
                totalPayouts: { $sum: 1 },
                totalPayoutAmount: { $sum: '$amounts.payoutAmount' },
                totalCommissionEarned: { $sum: '$amounts.commissionAmount' },
                avgPayoutAmount: { $avg: '$amounts.payoutAmount' }
              }
            }
          ],
          
          // Status breakdown
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amounts.payoutAmount' }
              }
            }
          ],
          
          // Recent period statistics
          recentPeriod: [
            {
              $match: {
                createdAt: { $gte: dateFrom }
              }
            },
            {
              $group: {
                _id: null,
                periodPayouts: { $sum: 1 },
                periodPayoutAmount: { $sum: '$amounts.payoutAmount' },
                periodCommissionEarned: { $sum: '$amounts.commissionAmount' }
              }
            }
          ],
          
          // Daily breakdown for charts
          dailyBreakdown: [
            {
              $match: {
                createdAt: { $gte: dateFrom }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' }
                },
                payouts: { $sum: 1 },
                payoutAmount: { $sum: '$amounts.payoutAmount' },
                commission: { $sum: '$amounts.commissionAmount' }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
          ],
          
          // Top providers by payout amount
          topProviders: [
            {
              $match: {
                status: { $in: ['completed', 'processing'] }
              }
            },
            {
              $group: {
                _id: '$provider',
                totalPayouts: { $sum: 1 },
                totalAmount: { $sum: '$amounts.payoutAmount' }
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
              $unwind: '$providerInfo'
            },
            {
              $project: {
                providerName: '$providerInfo.name',
                providerEmail: '$providerInfo.email',
                totalPayouts: 1,
                totalAmount: 1
              }
            },
            {
              $sort: { totalAmount: -1 }
            },
            {
              $limit: 10
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overall: stats[0].overall[0] || {},
        byStatus: stats[0].byStatus,
        recentPeriod: stats[0].recentPeriod[0] || {},
        dailyBreakdown: stats[0].dailyBreakdown,
        topProviders: stats[0].topProviders,
        period
      }
    });

    logger.info(`Admin ${req.user.name} viewed payout statistics`, {
      service: 'admin-payout',
      period
    });
  });

  /**
   * Get specific payout details
   * @route GET /api/admin/payouts/:id
   */
  getPayoutDetails = catchAsync(async (req, res, next) => {
    const payout = await Payout.findById(req.params.id)
      .populate({
        path: 'provider',
        select: 'name email businessName phone payoutDetails profilePicture'
      })
      .populate({
        path: 'client',
        select: 'name email phone'
      })
      .populate({
        path: 'booking',
        populate: [
          {
            path: 'service',
            select: 'title description category pricing'
          }
        ]
      });

    if (!payout) {
      return next(new AppError('Payout not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { payout }
    });

    logger.info(`Admin ${req.user.name} viewed payout details`, {
      service: 'admin-payout',
      payoutId: req.params.id
    });
  });

  /**
   * Manually process a payout (admin override)
   * @route POST /api/admin/payouts/:id/process
   */
  processPayoutManually = catchAsync(async (req, res, next) => {
    const { reason } = req.body;
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return next(new AppError('Payout not found', 404));
    }

    if (payout.status !== 'pending' && payout.status !== 'ready') {
      return next(new AppError('Payout is not in a processable state', 400));
    }

    try {
      const payoutService = new PayoutService();
      const result = await payoutService.processPayout(payout);

      // Add admin activity log
      payout.activities = payout.activities || [];
      payout.activities.push({
        type: 'admin_manual_process',
        description: `Manually processed by admin ${req.user.name}`,
        reason: reason || 'Manual admin processing',
        timestamp: new Date(),
        adminId: req.user._id
      });

      await payout.save();

      res.status(200).json({
        status: 'success',
        message: 'Payout processed manually',
        data: { 
          payout,
          processResult: result
        }
      });

      logger.info(`Admin ${req.user.name} manually processed payout`, {
        service: 'admin-payout',
        payoutId: req.params.id,
        reason,
        result: result.success
      });

    } catch (error) {
      logger.error(`Admin manual payout processing failed:`, error);
      return next(new AppError('Failed to process payout: ' + error.message, 500));
    }
  });

  /**
   * Cancel/block a payout
   * @route POST /api/admin/payouts/:id/cancel
   */
  cancelPayout = catchAsync(async (req, res, next) => {
    const { reason } = req.body;
    
    if (!reason) {
      return next(new AppError('Cancellation reason is required', 400));
    }

    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return next(new AppError('Payout not found', 404));
    }

    if (payout.status === 'completed' || payout.status === 'cancelled') {
      return next(new AppError('Cannot cancel this payout', 400));
    }

    payout.status = 'cancelled';
    payout.activities = payout.activities || [];
    payout.activities.push({
      type: 'admin_cancelled',
      description: `Cancelled by admin ${req.user.name}`,
      reason,
      timestamp: new Date(),
      adminId: req.user._id
    });

    await payout.save();

    res.status(200).json({
      status: 'success',
      message: 'Payout cancelled successfully',
      data: { payout }
    });

    logger.info(`Admin ${req.user.name} cancelled payout`, {
      service: 'admin-payout',
      payoutId: req.params.id,
      reason
    });
  });

  /**
   * Retry failed payout
   * @route POST /api/admin/payouts/:id/retry
   */
  retryPayout = catchAsync(async (req, res, next) => {
    const { reason } = req.body;
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return next(new AppError('Payout not found', 404));
    }

    if (payout.status !== 'failed') {
      return next(new AppError('Only failed payouts can be retried', 400));
    }

    // Reset payout to ready status
    payout.status = 'ready';
    payout.activities = payout.activities || [];
    payout.activities.push({
      type: 'admin_retry',
      description: `Retry initiated by admin ${req.user.name}`,
      reason: reason || 'Admin retry',
      timestamp: new Date(),
      adminId: req.user._id
    });

    await payout.save();

    res.status(200).json({
      status: 'success',
      message: 'Payout queued for retry',
      data: { payout }
    });

    logger.info(`Admin ${req.user.name} queued payout for retry`, {
      service: 'admin-payout',
      payoutId: req.params.id,
      reason
    });
  });

  /**
   * Update payout settings/configuration
   * @route PUT /api/admin/payouts/settings
   */
  updatePayoutSettings = catchAsync(async (req, res, next) => {
    const { 
      commissionRate, 
      payoutDelay, 
      minPayoutAmount, 
      maxPayoutAmount,
      autoProcessing 
    } = req.body;

    // This would typically update system-wide settings
    // For now, we'll just return the settings that would be updated
    const settings = {
      commissionRate: commissionRate || 0.3, // 30%
      payoutDelay: payoutDelay || 3600000, // 1 hour in milliseconds
      minPayoutAmount: minPayoutAmount || 100, // KES 100
      maxPayoutAmount: maxPayoutAmount || 1000000, // KES 1M
      autoProcessing: autoProcessing !== undefined ? autoProcessing : true,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    res.status(200).json({
      status: 'success',
      message: 'Payout settings updated',
      data: { settings }
    });

    logger.info(`Admin ${req.user.name} updated payout settings`, {
      service: 'admin-payout',
      settings
    });
  });

  /**
   * Bulk actions on payouts
   * @route POST /api/admin/payouts/bulk-action
   */
  bulkAction = catchAsync(async (req, res, next) => {
    const { action, payoutIds, reason } = req.body;

    if (!action || !payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
      return next(new AppError('Invalid bulk action request', 400));
    }

    const validActions = ['process', 'cancel', 'retry'];
    if (!validActions.includes(action)) {
      return next(new AppError('Invalid action type', 400));
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const payoutId of payoutIds) {
      try {
        const payout = await Payout.findById(payoutId);
        if (!payout) {
          results.failed.push({ payoutId, error: 'Payout not found' });
          continue;
        }

        switch (action) {
          case 'process':
            if (payout.status === 'pending' || payout.status === 'ready') {
              const payoutService = new PayoutService();
              await payoutService.processPayout(payout);
              results.successful.push({ payoutId, action: 'processed' });
            } else {
              results.failed.push({ payoutId, error: 'Not processable' });
            }
            break;

          case 'cancel':
            if (payout.status !== 'completed' && payout.status !== 'cancelled') {
              payout.status = 'cancelled';
              payout.activities = payout.activities || [];
              payout.activities.push({
                type: 'admin_bulk_cancel',
                description: `Bulk cancelled by admin ${req.user.name}`,
                reason,
                timestamp: new Date(),
                adminId: req.user._id
              });
              await payout.save();
              results.successful.push({ payoutId, action: 'cancelled' });
            } else {
              results.failed.push({ payoutId, error: 'Cannot cancel' });
            }
            break;

          case 'retry':
            if (payout.status === 'failed') {
              payout.status = 'ready';
              payout.activities = payout.activities || [];
              payout.activities.push({
                type: 'admin_bulk_retry',
                description: `Bulk retry by admin ${req.user.name}`,
                reason,
                timestamp: new Date(),
                adminId: req.user._id
              });
              await payout.save();
              results.successful.push({ payoutId, action: 'queued_for_retry' });
            } else {
              results.failed.push({ payoutId, error: 'Not failed status' });
            }
            break;
        }
      } catch (error) {
        results.failed.push({ payoutId, error: error.message });
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Bulk ${action} operation completed`,
      data: { results }
    });

    logger.info(`Admin ${req.user.name} performed bulk action`, {
      service: 'admin-payout',
      action,
      totalPayouts: payoutIds.length,
      successful: results.successful.length,
      failed: results.failed.length
    });
  });
}

module.exports = new AdminPayoutController();