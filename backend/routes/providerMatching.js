const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const User = require('../models/User');
const Service = require('../models/Service');

/**
 * @route   POST /api/booking/match-providers
 * @desc    Find available providers for a service booking request
 * @access  Private (Client only)
 * @body    {
 *   category: string,     // Service category (plumbing, electrical, etc.)
 *   date: string,         // Preferred date (YYYY-MM-DD)
 *   time: string,         // Preferred time (HH:MM)
 *   duration: number,     // Expected duration in hours
 *   location: {
 *     area: string,       // Service area (Kileleshwa, Westlands, etc.)
 *     address: string,    // Full address
 *     coordinates?: { lat: number, lng: number }
 *   },
 *   providersNeeded: number, // Number of providers required
 *   urgency: string,      // 'normal', 'urgent', 'emergency'
 *   budget: { min: number, max: number } // Budget range
 * }
 */
router.post('/match-providers', protect, roleGuard(['client']), async (req, res) => {
  try {
    const { 
      category, 
      date, 
      time, 
      duration, 
      location, 
      providersNeeded = 1,
      urgency = 'normal',
      budget 
    } = req.body;

    // Validate required fields
    if (!category || !date || !time || !location?.area) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: category, date, time, and location.area are required'
      });
    }

    // Supported service areas
    const supportedAreas = ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo'];
    if (!supportedAreas.includes(location.area)) {
      return res.status(400).json({
        success: false,
        message: `Service not available in ${location.area}. Available areas: ${supportedAreas.join(', ')}`
      });
    }

    // Build provider search criteria
    const providerQuery = {
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.serviceAreas': { $in: [location.area] }
    };

    // Category-based skill filtering
    const categorySkillMap = {
      'plumbing': ['plumbing', 'pipe repair', 'water systems', 'bathroom repair'],
      'electrical': ['electrical', 'wiring', 'lighting', 'electrical repair'],
      'cleaning': ['cleaning', 'house cleaning', 'deep cleaning', 'office cleaning'],
      'carpentry': ['carpentry', 'furniture', 'woodwork', 'cabinet making'],
      'painting': ['painting', 'interior painting', 'exterior painting', 'wall decoration'],
      'gardening': ['gardening', 'landscaping', 'lawn care', 'plant care'],
      'movers': ['moving', 'relocation', 'packing', 'furniture moving', 'house moving', 'office relocation']
    };

    const categorySkills = categorySkillMap[category.toLowerCase()] || [category];
    providerQuery['providerProfile.skills'] = { 
      $in: categorySkills.map(skill => new RegExp(skill, 'i'))
    };

    // Budget filtering if provided
    if (budget && (budget.min || budget.max)) {
      const budgetQuery = {};
      if (budget.min) budgetQuery.$gte = budget.min;
      if (budget.max) budgetQuery.$lte = budget.max;
      providerQuery['providerProfile.hourlyRate'] = budgetQuery;
    }

    console.log('Provider search query:', JSON.stringify(providerQuery, null, 2));

    // Find matching providers
    let availableProviders = await User.find(providerQuery)
      .select('name email phone profilePicture providerProfile')
      .sort({ 
        'providerProfile.rating': -1,  // Highest rated first
        'providerProfile.reviewCount': -1  // Most reviewed second
      })
      .limit(Math.max(providersNeeded * 3, 10)); // Get more than needed for selection

    console.log(`Found ${availableProviders.length} potential providers`);

    // Filter by availability (basic check - can be enhanced)
    const requestDate = new Date(`${date}T${time}:00`);
    const isWeekend = requestDate.getDay() === 0 || requestDate.getDay() === 6;
    const isEvening = parseInt(time.split(':')[0]) >= 17;
    const isMorning = parseInt(time.split(':')[0]) < 9;

    // Enhance provider data with availability score and matching info
    const enhancedProviders = availableProviders.map(provider => {
      let availabilityScore = 1.0;
      let availabilityStatus = 'Available';
      let availabilityNotes = [];

      // Basic availability logic (can be enhanced with real availability data)
      const profile = provider.providerProfile || {};
      
      // Weekend availability check
      if (isWeekend) {
        availabilityScore *= 0.8;
        availabilityNotes.push('Weekend service (limited availability)');
      }

      // Evening/early morning check
      if (isEvening) {
        availabilityScore *= 0.9;
        availabilityNotes.push('Evening service available');
      } else if (isMorning) {
        availabilityScore *= 0.95;
        availabilityNotes.push('Early morning service available');
      }

      // Urgency factor
      if (urgency === 'emergency') {
        availabilityScore *= 0.7; // Not all providers available for emergency
        availabilityNotes.push('Emergency service - limited providers');
      } else if (urgency === 'urgent') {
        availabilityScore *= 0.85;
        availabilityNotes.push('Urgent service - same day available');
      }

      // Calculate match score based on skills, rating, and location
      let matchScore = 0;
      const skills = profile.skills || [];
      const matchingSkills = skills.filter(skill => 
        categorySkills.some(catSkill => 
          skill.toLowerCase().includes(catSkill.toLowerCase())
        )
      );
      
      matchScore += (matchingSkills.length / categorySkills.length) * 40; // Max 40 points for skills
      matchScore += ((profile.rating || 4.0) / 5.0) * 30; // Max 30 points for rating
      matchScore += Math.min((profile.reviewCount || 0) / 50, 1) * 20; // Max 20 points for reviews
      matchScore += availabilityScore * 10; // Max 10 points for availability

      // Price matching bonus
      if (budget && profile.hourlyRate) {
        const rate = profile.hourlyRate;
        if (rate >= (budget.min || 0) && rate <= (budget.max || Infinity)) {
          matchScore += 10;
        }
      }

      return {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        profilePicture: provider.profilePicture,
        profile: {
          businessName: profile.businessName || provider.name,
          experience: profile.experience || 'Professional service provider',
          skills: skills,
          hourlyRate: profile.hourlyRate || null,
          rating: profile.rating || 4.0,
          reviewCount: profile.reviewCount || 0,
          completedJobs: profile.completedJobs || 0,
          serviceAreas: profile.serviceAreas || [location.area],
          bio: profile.bio || `Experienced ${category} professional in ${location.area}`
        },
        availability: {
          status: availabilityStatus,
          score: Math.round(availabilityScore * 100) / 100,
          notes: availabilityNotes,
          estimatedResponseTime: urgency === 'emergency' ? '30-60 minutes' : 
                                urgency === 'urgent' ? '2-4 hours' : '4-24 hours'
        },
        matching: {
          score: Math.round(matchScore),
          matchingSkills: matchingSkills,
          categoryMatch: matchingSkills.length > 0,
          areaMatch: (profile.serviceAreas || []).includes(location.area),
          budgetMatch: budget ? (
            profile.hourlyRate >= (budget.min || 0) && 
            profile.hourlyRate <= (budget.max || Infinity)
          ) : true
        },
        estimatedCost: {
          baseRate: profile.hourlyRate || 1500,
          estimatedTotal: (profile.hourlyRate || 1500) * duration,
          currency: 'KES',
          priceType: 'hourly'
        }
      };
    });

    // Sort by match score (highest first)
    enhancedProviders.sort((a, b) => b.matching.score - a.matching.score);

    // Get the best matches up to the requested number
    const selectedProviders = enhancedProviders.slice(0, providersNeeded * 2); // Get double for selection

    // Calculate total estimated cost
    const totalEstimatedCost = selectedProviders
      .slice(0, providersNeeded)
      .reduce((total, provider) => total + provider.estimatedCost.estimatedTotal, 0);

    // Prepare response
    const response = {
      success: true,
      data: {
        searchCriteria: {
          category,
          date,
          time,
          duration,
          location,
          providersNeeded,
          urgency,
          budget
        },
        matching: {
          totalFound: availableProviders.length,
          totalReturned: selectedProviders.length,
          recommendedProviders: selectedProviders.slice(0, providersNeeded),
          alternativeProviders: selectedProviders.slice(providersNeeded),
          serviceAvailable: selectedProviders.length > 0
        },
        providers: selectedProviders,
        pricing: {
          estimatedTotal: totalEstimatedCost,
          averageHourlyRate: Math.round(
            selectedProviders.reduce((sum, p) => sum + p.estimatedCost.baseRate, 0) / 
            selectedProviders.length
          ) || 1500,
          currency: 'KES',
          breakdown: `${providersNeeded} provider(s) × ${duration} hour(s)`
        },
        availability: {
          area: location.area,
          timeSlot: `${date} at ${time}`,
          urgencyLevel: urgency,
          supportedAreas: supportedAreas
        }
      }
    };

    // Add service unavailable message if no providers found
    if (selectedProviders.length === 0) {
      response.data.message = `No ${category} providers available in ${location.area} for ${date} at ${time}. Try adjusting your criteria or contact support.`;
      response.data.suggestions = [
        'Try a different time slot',
        'Consider nearby service areas',
        'Adjust your budget range',
        'Book for a later date'
      ];
    }

    res.json(response);

  } catch (error) {
    console.error('Provider matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding available providers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/booking/service-areas
 * @desc    Get available service areas and their info
 * @access  Public
 */
router.get('/service-areas', async (req, res) => {
  try {
    const serviceAreas = [
      {
        name: 'Kileleshwa',
        zone: 'Central Nairobi',
        estimatedTravelTime: '15-30 minutes',
        serviceAvailability: 'High',
        averageRates: { min: 1200, max: 3500 }
      },
      {
        name: 'Westlands',
        zone: 'Central Nairobi', 
        estimatedTravelTime: '10-25 minutes',
        serviceAvailability: 'High',
        averageRates: { min: 1500, max: 4000 }
      },
      {
        name: 'Kilimani',
        zone: 'Central Nairobi',
        estimatedTravelTime: '15-30 minutes', 
        serviceAvailability: 'High',
        averageRates: { min: 1400, max: 3800 }
      },
      {
        name: 'Parklands',
        zone: 'North Nairobi',
        estimatedTravelTime: '20-35 minutes',
        serviceAvailability: 'Medium',
        averageRates: { min: 1300, max: 3200 }
      },
      {
        name: 'Nyayo',
        zone: 'South Nairobi',
        estimatedTravelTime: '25-40 minutes',
        serviceAvailability: 'Medium', 
        averageRates: { min: 1200, max: 3000 }
      }
    ];

    res.json({
      success: true,
      data: {
        areas: serviceAreas,
        totalAreas: serviceAreas.length,
        expandingTo: ['Kilifi', 'Nakuru', 'Kisumu'],
        contactInfo: 'For services outside these areas, contact support'
      }
    });

  } catch (error) {
    console.error('Service areas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service areas'
    });
  }
});

module.exports = router;