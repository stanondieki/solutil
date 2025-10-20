const express = require('express');
const router = express.Router();
const EnhancedProviderMatching = require('../services/enhancedProviderMatching');
const { protect } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Find optimal providers using comprehensive matching
 * @route   POST /api/booking/find-optimal-providers
 * @access  Private
 */
router.post('/find-optimal-providers', protect, catchAsync(async (req, res, next) => {
  console.log('🎯 Finding optimal providers with enhanced matching...');
  
  const {
    category,
    location,
    date,
    time,
    urgency = 'normal',
    providersNeeded = 1,
    budget,
    duration = 2,
    customerPreferences = {}
  } = req.body;

  // Validate required fields
  if (!category || !location || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: category, location, date, time'
    });
  }

  // Prepare booking data for matching
  const bookingData = {
    category: category.id || category,
    location,
    date,
    time,
    urgency,
    providersNeeded,
    budget,
    duration,
    customerPreferences,
    userId: req.user.id
  };

  console.log('📋 Booking data for matching:', {
    category: bookingData.category,
    area: location.area,
    urgency,
    providersNeeded
  });

  try {
    // Use enhanced matching service
    const optimalProviders = await EnhancedProviderMatching.findBestProviders(bookingData);

    if (optimalProviders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No providers available for the specified criteria',
        data: {
          providers: [],
          totalFound: 0,
          searchCriteria: bookingData,
          suggestions: [
            'Try adjusting the date or time',
            'Consider expanding the service area',
            'Check if the urgency level can be relaxed'
          ]
        }
      });
    }

    // Calculate match statistics
    const averageScore = optimalProviders.reduce((sum, p) => sum + p.matchScore, 0) / optimalProviders.length;
    const topScore = Math.max(...optimalProviders.map(p => p.matchScore));
    
    console.log(`✅ Found ${optimalProviders.length} optimal providers`);
    console.log(`📊 Match quality - Top: ${topScore}, Average: ${averageScore.toFixed(1)}`);

    res.status(200).json({
      success: true,
      message: `Found ${optimalProviders.length} optimal providers`,
      data: {
        providers: optimalProviders,
        totalFound: optimalProviders.length,
        matching: {
          algorithm: 'enhanced-comprehensive',
          averageScore: Math.round(averageScore),
          topScore: topScore,
          factors: [
            'Service expertise match',
            'Rating and reputation',
            'Experience and reliability',
            'Location proximity',
            'Availability and response time',
            'Pricing compatibility',
            'Recent performance'
          ]
        },
        searchCriteria: bookingData
      }
    });

  } catch (error) {
    console.error('❌ Enhanced provider matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding optimal providers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

/**
 * @desc    Get provider matching score breakdown
 * @route   GET /api/booking/provider-score/:providerId
 * @access  Private
 */
router.get('/provider-score/:providerId', protect, catchAsync(async (req, res, next) => {
  const { providerId } = req.params;
  const { category, location, urgency = 'normal' } = req.query;

  if (!category || !location) {
    return res.status(400).json({
      success: false,
      message: 'Category and location are required for score calculation'
    });
  }

  try {
    // Get provider data
    const User = require('../models/User');
    const provider = await User.findById(providerId).populate('providerProfile').lean();
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Calculate score for this specific provider
    const bookingData = {
      category,
      location: { area: location },
      urgency
    };

    const score = await EnhancedProviderMatching.calculateProviderScore(provider, bookingData);

    res.status(200).json({
      success: true,
      data: {
        providerId,
        providerName: provider.name,
        score: score.total,
        maxPossible: score.maxPossible,
        percentage: Math.round((score.total / score.maxPossible) * 100),
        breakdown: score.breakdown,
        recommendations: generateProviderRecommendations(score.breakdown)
      }
    });

  } catch (error) {
    console.error('Error calculating provider score:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating provider score'
    });
  }
}));

/**
 * Generate recommendations for providers to improve their scores
 */
function generateProviderRecommendations(scoreBreakdown) {
  const recommendations = [];

  if (scoreBreakdown.serviceMatch?.score < 15) {
    recommendations.push({
      category: 'Service Expertise',
      priority: 'High',
      suggestion: 'Add more specific skills and create services in your expertise areas'
    });
  }

  if (scoreBreakdown.reputation?.score < 15) {
    recommendations.push({
      category: 'Reputation',
      priority: 'High', 
      suggestion: 'Focus on delivering excellent service to improve ratings and get more reviews'
    });
  }

  if (scoreBreakdown.experience?.score < 10) {
    recommendations.push({
      category: 'Experience',
      priority: 'Medium',
      suggestion: 'Complete more jobs and update your experience information'
    });
  }

  if (scoreBreakdown.location?.score < 10) {
    recommendations.push({
      category: 'Location Coverage',
      priority: 'Medium',
      suggestion: 'Consider expanding your service areas to cover more locations'
    });
  }

  if (scoreBreakdown.pricing?.score < 7) {
    recommendations.push({
      category: 'Pricing',
      priority: 'Low',
      suggestion: 'Review your pricing to ensure it\'s competitive and matches market rates'
    });
  }

  return recommendations;
}

module.exports = router;