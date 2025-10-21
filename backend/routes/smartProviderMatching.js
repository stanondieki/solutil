const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const User = require('../models/User');
const ProviderService = require('../models/ProviderService');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

/**
 * Smart Provider Matching System
 * Enhanced with availability checking, service area validation, and category-specific matching
 */

/**
 * @route   POST /api/booking/smart-match-providers
 * @desc    Intelligent provider matching with availability and area validation
 * @access  Private (Client only)
 */
router.post('/smart-match-providers', protect, roleGuard(['client']), async (req, res) => {
  try {
    const { 
      category,
      date, 
      time, 
      location, 
      providersNeeded = 1,
      urgency = 'normal',
      budget,
      selectedSubService
    } = req.body;

    console.log('🧠 Smart Provider Matching Request:', {
      category,
      date,
      time,
      location: location?.area,
      providersNeeded,
      urgency,
      selectedSubService: selectedSubService?.name
    });

    // Validate required fields
    if (!category || !date || !time || !location?.area) {
      return res.status(400).json({
        success: false,
        message: 'Category, date, time, and location area are required'
      });
    }

    // Parse the requested date and time
    const requestedDate = new Date(date);
    const [startHour, startMinute] = time.split(':').map(Number);
    
    // Create start and end times for the booking (assume 2-hour window)
    const bookingStart = new Date(requestedDate);
    bookingStart.setHours(startHour, startMinute, 0, 0);
    
    const bookingEnd = new Date(bookingStart);
    bookingEnd.setHours(startHour + 2, startMinute, 0, 0); // 2-hour service window

    console.log('📅 Booking window:', {
      start: bookingStart.toISOString(),
      end: bookingEnd.toISOString()
    });

    // Step 1: Find category-specific providers with matching services
    const categoryMapping = {
      'cleaning': 'cleaning',
      'electrical': 'electrical', 
      'plumbing': 'plumbing',
      'carpentry': 'carpentry',
      'painting': 'painting',
      'gardening': 'gardening',
      'movers': 'moving',
      'moving': 'moving',
      'fumigation': 'fumigation',
      'appliance repair': 'appliance repair'
    };

    const searchCategory = categoryMapping[category.toLowerCase()] || category;
    console.log(`🎯 Searching for '${searchCategory}' services in ${location.area}`);

    // Find providers with specific services for this category
    let providerServices = await ProviderService.find({
      $and: [
        {
          $or: [
            { category: { $regex: new RegExp(`^${searchCategory}$`, 'i') } },
            { title: { $regex: new RegExp(searchCategory, 'i') } }
          ]
        },
        { isActive: true }
      ]
    })
    .populate({
      path: 'providerId',
      match: { 
        userType: 'provider',
        providerStatus: 'approved'
      },
      select: 'name email phone avatar providerProfile providerStatus'
    })
    .lean();

    // Filter out services without valid providers
    providerServices = providerServices.filter(service => service.providerId);

    console.log(`📋 Found ${providerServices.length} category-specific services`);

    // Step 2: Filter by service area coverage
    const areaFilteredServices = providerServices.filter(service => {
      const provider = service.providerId;
      const serviceAreas = provider.providerProfile?.serviceAreas || [];
      
      // Check if provider serves the requested area
      const servesArea = serviceAreas.length === 0 || // Serves all areas if none specified
                        serviceAreas.includes(location.area) ||
                        serviceAreas.includes('Nairobi') || // Nairobi-wide coverage
                        serviceAreas.some(area => area.toLowerCase().includes(location.area.toLowerCase()));
      
      if (servesArea) {
        console.log(`✅ ${provider.name} serves ${location.area}`);
      } else {
        console.log(`❌ ${provider.name} does not serve ${location.area} (serves: ${serviceAreas.join(', ')})`);
      }
      
      return servesArea;
    });

    console.log(`🗺️ After area filtering: ${areaFilteredServices.length} providers`);

    // Step 3: Check availability - filter out providers who are already booked
    const availableProviders = [];
    
    for (const service of areaFilteredServices) {
      const provider = service.providerId;
      
      // Check for booking conflicts
      const conflictingBookings = await Booking.find({
        provider: provider._id,
        scheduledDate: {
          $gte: new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate()),
          $lt: new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate() + 1)
        },
        status: { $in: ['pending', 'confirmed', 'in-progress'] }
      }).lean();

      // Check if any booking conflicts with our time slot
      let hasConflict = false;
      for (const booking of conflictingBookings) {
        const existingStart = new Date(booking.scheduledDate);
        const [existingStartHour, existingStartMin] = booking.scheduledTime.start.split(':').map(Number);
        const [existingEndHour, existingEndMin] = booking.scheduledTime.end.split(':').map(Number);
        
        existingStart.setHours(existingStartHour, existingStartMin, 0, 0);
        const existingEnd = new Date(existingStart);
        existingEnd.setHours(existingEndHour, existingEndMin, 0, 0);

        // Check for time overlap
        if ((bookingStart < existingEnd) && (bookingEnd > existingStart)) {
          hasConflict = true;
          console.log(`⏰ ${provider.name} has booking conflict: ${booking.scheduledTime.start}-${booking.scheduledTime.end}`);
          break;
        }
      }

      if (!hasConflict) {
        console.log(`✅ ${provider.name} is available at ${time}`);
        availableProviders.push({
          ...service,
          conflictingBookings: conflictingBookings.length
        });
      } else {
        console.log(`❌ ${provider.name} is not available at ${time}`);
      }
    }

    console.log(`⏰ After availability check: ${availableProviders.length} available providers`);

    // Step 4: Enhanced provider data formatting with smart scoring
    const enhancedProviders = availableProviders.map(service => {
      const provider = service.providerId;
      const profile = provider.providerProfile || {};
      
      // Calculate smart match score
      const matchScore = calculateSmartMatchScore({
        category: searchCategory,
        serviceTitle: service.title,
        selectedSubService: selectedSubService?.name,
        rating: profile.rating || 4.0,
        reviewCount: profile.reviewCount || 0,
        totalJobs: profile.totalJobs || 0,
        experience: profile.experience,
        serviceAreas: profile.serviceAreas || [],
        requestedArea: location.area,
        urgency,
        hourlyRate: service.price || profile.hourlyRate,
        budget,
        availability: true, // Already filtered for availability
        conflictingBookings: service.conflictingBookings
      });

      return {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        profilePicture: getSmartProfilePicture(provider, searchCategory).url,
        profilePictureType: getSmartProfilePicture(provider, searchCategory).type,
        matchType: 'smart-category-match',
        serviceId: service._id,
        serviceName: service.title,
        servicePrice: service.price,
        servicePricing: service.priceType,
        availability: {
          status: 'available',
          nextSlot: time,
          conflictingBookings: service.conflictingBookings
        },
        profile: {
          businessName: profile.businessName || provider.name,
          rating: profile.rating || 4.0,
          reviewCount: profile.reviewCount || 0,
          totalJobs: profile.totalJobs || 0,
          experience: profile.experience || 'Professional service provider',
          skills: profile.skills || [],
          serviceAreas: profile.serviceAreas || ['Nairobi'],
          hourlyRate: service.price || profile.hourlyRate || 2000,
          availability: 'Available',
          responseTime: calculateResponseTime(profile.rating, profile.reviewCount),
          verified: profile.isVerified || false,
          avatar: getSmartProfilePicture(provider, searchCategory).url,
          avatarType: getSmartProfilePicture(provider, searchCategory).type
        },
        matchScore,
        smartFactors: {
          categoryMatch: true,
          areaMatch: true,
          timeAvailable: true,
          experienceLevel: profile.totalJobs || 0,
          ratingScore: profile.rating || 4.0
        }
      };
    });

    // Sort by match score (highest first)
    enhancedProviders.sort((a, b) => b.matchScore - a.matchScore);

    // Step 5: Fallback for emergency/urgent cases if no providers found
    if (enhancedProviders.length === 0 && urgency === 'emergency') {
      console.log('🚨 No available providers for emergency - checking 24/7 providers...');
      
      const emergencyProviders = await findEmergencyProviders(searchCategory, location.area);
      enhancedProviders.push(...emergencyProviders);
    }

    const response = {
      success: true,
      data: {
        providers: enhancedProviders.slice(0, Math.max(providersNeeded * 3, 10)), // Return 3x requested or minimum 10
        totalFound: enhancedProviders.length,
        searchCriteria: {
          category: searchCategory,
          area: location.area,
          date: date,
          time: time,
          urgency
        },
        matching: {
          algorithm: 'smart-availability-aware',
          factors: ['category-specific', 'area-coverage', 'time-availability', 'rating-based'],
          totalChecked: providerServices.length,
          areaFiltered: areaFilteredServices.length,
          availableProviders: availableProviders.length
        }
      }
    };

    console.log(`✅ Returning ${enhancedProviders.length} smart-matched providers`);
    res.json(response);

  } catch (error) {
    console.error('❌ Smart Provider Matching Error:', error);
    logger.error('Smart Provider Matching Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error finding available providers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Calculate smart match score based on multiple factors
 */
function calculateSmartMatchScore({
  category,
  serviceTitle,
  selectedSubService,
  rating,
  reviewCount,
  totalJobs,
  experience,
  serviceAreas,
  requestedArea,
  urgency,
  hourlyRate,
  budget,
  availability,
  conflictingBookings
}) {
  let score = 0;

  // Base score for availability (essential)
  if (availability) score += 50;

  // Category/service match (very important)
  if (serviceTitle && selectedSubService) {
    if (serviceTitle.toLowerCase().includes(selectedSubService.toLowerCase())) {
      score += 30; // Exact service match
    } else if (serviceTitle.toLowerCase().includes(category.toLowerCase())) {
      score += 20; // Category match
    }
  } else if (serviceTitle && serviceTitle.toLowerCase().includes(category.toLowerCase())) {
    score += 25;
  }

  // Experience and rating (important)
  score += Math.min(rating * 5, 25); // Max 25 points for 5-star rating
  score += Math.min(reviewCount * 0.5, 15); // Max 15 points for reviews
  score += Math.min(totalJobs * 0.3, 20); // Max 20 points for job history

  // Area coverage (important)
  if (serviceAreas.includes(requestedArea)) {
    score += 15; // Exact area match
  } else if (serviceAreas.includes('Nairobi')) {
    score += 10; // Nairobi-wide coverage
  } else if (serviceAreas.length === 0) {
    score += 5; // Serves all areas
  }

  // Urgency handling
  if (urgency === 'emergency') {
    score += 10; // Bonus for emergency availability
  }

  // Budget compatibility
  if (budget && hourlyRate) {
    if (hourlyRate <= budget.max) {
      score += 10;
    }
    if (hourlyRate >= budget.min) {
      score += 5;
    }
  }

  // Penalty for busy providers (many conflicting bookings)
  score -= Math.min(conflictingBookings * 2, 10);

  return Math.round(score);
}

/**
 * Get actual profile picture with comprehensive fallbacks
 */
function getSmartProfilePicture(provider, category) {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
  
  console.log(`🔍 Profile picture debug for ${provider.name}:`, {
    avatarUrl: provider.avatar?.url,
    avatarPublicId: provider.avatar?.public_id,
    providerProfilePicture: provider.providerProfile?.profilePicture,
    providerAvatar: provider.providerProfile?.avatar,
    businessLogo: provider.providerProfile?.businessLogo
  });
  
  // Priority 1: User's uploaded avatar (main profile picture)
  if (provider.avatar?.url) {
    console.log(`✅ Using actual avatar for ${provider.name}: ${provider.avatar.url}`);
    return {
      url: provider.avatar.url,
      type: 'user-avatar'
    };
  }

  // Priority 2: Provider profile picture from providerProfile
  if (provider.providerProfile?.profilePicture) {
    const profilePictureUrl = provider.providerProfile.profilePicture.startsWith('http') 
      ? provider.providerProfile.profilePicture 
      : `${BACKEND_URL}${provider.providerProfile.profilePicture.startsWith('/') ? '' : '/'}${provider.providerProfile.profilePicture}`;
    
    console.log(`✅ Using provider profile picture for ${provider.name}: ${profilePictureUrl}`);
    return {
      url: profilePictureUrl,
      type: 'provider-profile'
    };
  }

  // Priority 3: Avatar from providerProfile
  if (provider.providerProfile?.avatar) {
    const avatarUrl = provider.providerProfile.avatar.startsWith('http') 
      ? provider.providerProfile.avatar 
      : `${BACKEND_URL}${provider.providerProfile.avatar.startsWith('/') ? '' : '/'}${provider.providerProfile.avatar}`;
    
    console.log(`✅ Using provider avatar for ${provider.name}: ${avatarUrl}`);
    return {
      url: avatarUrl,
      type: 'provider-avatar'
    };
  }

  // Priority 4: Business logo if available
  if (provider.providerProfile?.businessLogo) {
    const logoUrl = provider.providerProfile.businessLogo.startsWith('http') 
      ? provider.providerProfile.businessLogo 
      : `${BACKEND_URL}${provider.providerProfile.businessLogo.startsWith('/') ? '' : '/'}${provider.providerProfile.businessLogo}`;
    
    console.log(`✅ Using business logo for ${provider.name}: ${logoUrl}`);
    return {
      url: logoUrl,
      type: 'business-logo'
    };
  }

  // Fallback: Professional category-specific avatars
  const categoryAvatars = {
    'cleaning': 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=200&h=200&fit=crop&crop=face',
    'electrical': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'plumbing': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    'carpentry': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    'painting': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'gardening': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    'moving': 'https://images.unsplash.com/photo-1521341957697-b93449760f30?w=200&h=200&fit=crop&crop=face',
    'fumigation': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'appliance repair': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face'
  };

  const fallbackUrl = categoryAvatars[category] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face';
  console.log(`⚠️ Using fallback avatar for ${provider.name}: ${fallbackUrl}`);
  
  return {
    url: fallbackUrl,
    type: 'category-fallback'
  };
}

/**
 * Calculate response time based on provider metrics
 */
function calculateResponseTime(rating, reviewCount) {
  if (rating >= 4.5 && reviewCount >= 10) {
    return '5-15 min';
  } else if (rating >= 4.0 && reviewCount >= 5) {
    return '10-30 min';
  } else {
    return '30-60 min';
  }
}

/**
 * Find emergency providers (24/7 availability)
 */
async function findEmergencyProviders(category, area) {
  try {
    const emergencyProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.emergencyService': true,
      $or: [
        { 'providerProfile.serviceAreas': { $in: [area] } },
        { 'providerProfile.serviceAreas': 'Nairobi' },
        { 'providerProfile.serviceAreas': { $size: 0 } }
      ]
    }).select('name email phone profilePicture providerProfile').limit(5);

    return emergencyProviders.map(provider => ({
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      profilePicture: getSmartProfilePicture(provider, category).url,
      matchType: 'emergency-fallback',
      availability: {
        status: 'emergency-available',
        type: '24/7'
      },
      profile: {
        ...provider.providerProfile,
        emergencyService: true,
        responseTime: '15-45 min'
      },
      matchScore: 80 // High score for emergency availability
    }));
  } catch (error) {
    console.error('Error finding emergency providers:', error);
    return [];
  }
}

module.exports = router;