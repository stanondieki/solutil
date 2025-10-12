const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const User = require('../models/User');
const ProviderService = require('../models/ProviderService');
const logger = require('../utils/logger');

/**
 * Enhanced Provider Matching Service
 * Reimagined for better reliability and user experience
 */

/**
 * @route   POST /api/booking/match-providers-v2
 * @desc    Smart provider matching with improved algorithm
 * @access  Private (Client only)
 */
router.post('/match-providers-v2', protect, roleGuard(['client']), async (req, res) => {
  try {
    const { 
      category,
      date, 
      time, 
      location, 
      providersNeeded = 1,
      urgency = 'normal',
      budget
    } = req.body;

    console.log('🔍 Enhanced Provider Matching Request:', {
      category,
      date,
      time,
      location: location?.area,
      providersNeeded,
      urgency
    });

    // Validate required fields
    if (!category || !location?.area) {
      return res.status(400).json({
        success: false,
        message: 'Category and location area are required'
      });
    }

    // Step 1: Find providers through ProviderService (primary method)
    const categoryMapping = {
      'cleaning': 'cleaning',
      'electrical': 'electrical', 
      'plumbing': 'plumbing',
      'carpentry': 'carpentry',
      'painting': 'painting',
      'gardening': 'gardening',
      'movers': 'moving'
    };

    const searchCategory = categoryMapping[category.toLowerCase()] || category;
    console.log(`🎯 Searching for '${searchCategory}' services`);

    // Primary: Find through ProviderService model
    const providerServices = await ProviderService.find({
      $or: [
        { category: searchCategory },
        { category: new RegExp(searchCategory, 'i') },
        { title: new RegExp(searchCategory, 'i') }
      ],
      isActive: true
    })
    .populate({
      path: 'providerId',
      match: { 
        userType: 'provider',
        providerStatus: 'approved', // ONLY approved providers
        $or: [
          { 'providerProfile.serviceAreas': { $in: [location.area] } },
          { 'providerProfile.serviceAreas': 'Nairobi' }, // Fallback to Nairobi-wide
          { 'providerProfile.serviceAreas': { $size: 0 } } // Include providers without specific areas
        ]
      },
      select: 'name email phone profilePicture providerProfile providerStatus'
    })
    .limit(20);

    // Filter out null providers (those who didn't match the populate criteria)
    const validProviderServices = providerServices.filter(service => service.providerId);

    console.log(`✅ Found ${validProviderServices.length} matching provider services`);

    // Step 2: If no ProviderService matches, search by skills (secondary method)
    let fallbackProviders = [];
    if (validProviderServices.length === 0) {
      console.log('🔄 No ProviderService matches, trying skill-based search...');
      
      const skillKeywords = {
        'cleaning': ['cleaning', 'house cleaning', 'deep cleaning', 'office cleaning'],
        'electrical': ['electrical', 'wiring', 'lighting', 'electrical repair'],
        'plumbing': ['plumbing', 'pipe repair', 'water systems', 'bathroom repair'],
        'carpentry': ['carpentry', 'furniture', 'woodwork', 'cabinet making'],
        'painting': ['painting', 'interior painting', 'exterior painting'],
        'gardening': ['gardening', 'landscaping', 'lawn care'],
        'movers': ['moving', 'relocation', 'packing', 'furniture moving']
      };

      const searchKeywords = skillKeywords[searchCategory] || [searchCategory];
      
      fallbackProviders = await User.find({
        userType: 'provider',
        providerStatus: 'approved', // ONLY approved providers
        'providerProfile.skills': { 
          $in: searchKeywords.map(keyword => new RegExp(keyword, 'i'))
        },
        $or: [
          { 'providerProfile.serviceAreas': { $in: [location.area] } },
          { 'providerProfile.serviceAreas': 'Nairobi' },
          { 'providerProfile.serviceAreas': { $size: 0 } }
        ]
      }).select('name email phone profilePicture providerProfile providerStatus').limit(10);

      console.log(`✅ Found ${fallbackProviders.length} skill-based matches`);
    }

    // Step 3: Build unified provider list with enhanced data
    const allMatches = [];

    // Add ProviderService matches (higher priority)
    validProviderServices.forEach(service => {
      const provider = service.providerId;
      const profile = provider.providerProfile || {};
      
      allMatches.push({
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        profilePicture: provider.profilePicture,
        matchType: 'service',
        serviceId: service._id,
        serviceName: service.title,
        servicePrice: service.price,
        servicePricing: service.priceType,
        profile: {
          businessName: profile.businessName || provider.name,
          rating: profile.rating || 4.0,
          reviewCount: profile.reviewCount || 0,
          totalJobs: profile.totalJobs || 0,
          experience: profile.experience || 'Professional service provider',
          skills: profile.skills || [],
          serviceAreas: profile.serviceAreas || ['Nairobi'],
          hourlyRate: service.price || profile.hourlyRate || 2000,
          availability: profile.availability || 'Available',
          responseTime: '10-30 min',
          verified: profile.isVerified || false
        },
        matchScore: calculateMatchScore({
          matchType: 'service',
          rating: profile.rating || 4.0,
          reviewCount: profile.reviewCount || 0,
          totalJobs: profile.totalJobs || 0,
          hasSpecificService: true,
          location: location.area,
          serviceAreas: profile.serviceAreas || [],
          urgency
        })
      });
    });

    // Add skill-based matches (lower priority, only if needed)
    if (allMatches.length < providersNeeded * 2) {
      fallbackProviders.forEach(provider => {
        // Avoid duplicates
        if (!allMatches.find(match => match._id.toString() === provider._id.toString())) {
          const profile = provider.providerProfile || {};
          
          allMatches.push({
            _id: provider._id,
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            profilePicture: provider.profilePicture,
            matchType: 'skill',
            profile: {
              businessName: profile.businessName || provider.name,
              rating: profile.rating || 4.0,
              reviewCount: profile.reviewCount || 0,
              totalJobs: profile.totalJobs || 0,
              experience: profile.experience || 'Professional service provider',
              skills: profile.skills || [],
              serviceAreas: profile.serviceAreas || ['Nairobi'],
              hourlyRate: profile.hourlyRate || 2000,
              availability: profile.availability || 'Available',
              responseTime: '10-30 min',
              verified: profile.isVerified || false
            },
            matchScore: calculateMatchScore({
              matchType: 'skill',
              rating: profile.rating || 4.0,
              reviewCount: profile.reviewCount || 0,
              totalJobs: profile.totalJobs || 0,
              hasSpecificService: false,
              location: location.area,
              serviceAreas: profile.serviceAreas || [],
              urgency
            })
          });
        }
      });
    }

    // Step 4: Sort by match score and apply filters
    allMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Step 5: Apply availability and budget filters
    const filteredMatches = allMatches.filter(provider => {
      // Budget filter
      if (budget && (budget.min || budget.max)) {
        const rate = provider.profile.hourlyRate;
        if (budget.min && rate < budget.min) return false;
        if (budget.max && rate > budget.max) return false;
      }
      
      // Basic availability check (can be enhanced)
      if (date && time) {
        const requestDate = new Date(`${date}T${time}:00`);
        const isWeekend = requestDate.getDay() === 0 || requestDate.getDay() === 6;
        const isEarly = parseInt(time.split(':')[0]) < 7;
        const isLate = parseInt(time.split(':')[0]) >= 20;
        
        // Filter out providers who might not be available
        if ((isWeekend || isEarly || isLate) && urgency !== 'emergency') {
          // Could add specific availability data here
        }
      }
      
      return true;
    });

    // Step 6: Return results
    const response = {
      success: true,
      data: {
        providers: filteredMatches.slice(0, Math.max(providersNeeded * 3, 10)),
        total: filteredMatches.length,
        searchCriteria: {
          category: searchCategory,
          location: location.area,
          providersNeeded,
          urgency
        },
        matchingSummary: {
          serviceMatches: validProviderServices.length,
          skillMatches: fallbackProviders.length,
          totalFiltered: filteredMatches.length
        }
      }
    };

    console.log(`🎉 Returning ${response.data.providers.length} matched providers`);
    res.json(response);

  } catch (error) {
    console.error('❌ Enhanced provider matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find matching providers',
      error: error.message
    });
  }
});

/**
 * Calculate provider match score
 */
function calculateMatchScore({
  matchType,
  rating = 4.0,
  reviewCount = 0,
  totalJobs = 0,
  hasSpecificService = false,
  location = '',
  serviceAreas = [],
  urgency = 'normal'
}) {
  let score = 0;

  // Base score for match type
  score += matchType === 'service' ? 50 : 20;
  
  // Specific service bonus
  if (hasSpecificService) score += 30;
  
  // Rating score (0-25 points)
  score += (rating / 5.0) * 25;
  
  // Experience score (0-20 points)
  score += Math.min(totalJobs / 10, 2) * 10; // Max 20 points
  
  // Review count score (0-15 points)
  score += Math.min(reviewCount / 20, 1) * 15;
  
  // Location match bonus (0-10 points)
  if (serviceAreas.includes(location)) {
    score += 10;
  } else if (serviceAreas.includes('Nairobi')) {
    score += 5;
  }
  
  // Urgency factor
  if (urgency === 'emergency') {
    score *= 0.8; // Not all providers available for emergency
  } else if (urgency === 'urgent') {
    score *= 0.9;
  }

  return Math.round(score);
}

module.exports = router;