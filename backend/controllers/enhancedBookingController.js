const Booking = require('../models/Booking');
const ProviderService = require('../models/ProviderService');
const User = require('../models/User');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

/**
 * Enhanced Simple Booking Creation
 * Reimagined for better reliability and user experience
 */

// @desc    Create enhanced simple booking with improved provider matching
// @route   POST /api/bookings/simple-v2
// @access  Private (Client)
exports.createEnhancedSimpleBooking = catchAsync(async (req, res, next) => {
  try {
    console.log('=== ENHANCED SIMPLE BOOKING CREATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?.id, req.user?.userType);
    
    const {
      category,
      date,
      time,
      location,
      description,
      urgency = 'normal',
      providersNeeded = 1,
      paymentTiming = 'pay-after',
      paymentMethod = 'cash',
      selectedProvider, // If user selected a specific provider
      totalAmount
    } = req.body;

    // Validate required fields
    if (!category?.id || !date || !time || !location?.area) {
      return next(new AppError('Missing required fields: category, date, time, and location are required', 400));
    }

    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    console.log('🎯 Enhanced booking creation for:', {
      category: category.id,
      location: location.area,
      selectedProvider: selectedProvider?.id,
      bookingNumber
    });

    // Step 1: Provider Assignment Strategy
    let assignedProvider = null;
    let assignedService = null;
    let providerAssignmentMethod = '';

    if (selectedProvider?.id && selectedProvider.id !== 'temp') {
      // User selected a specific provider
      console.log('👤 Using user-selected provider:', selectedProvider.name);
      assignedProvider = selectedProvider.id;
      assignedService = selectedProvider.serviceId;
      providerAssignmentMethod = 'user-selected';
    } else {
      // Auto-assign using enhanced matching
      console.log('🤖 Auto-assigning provider using enhanced matching...');
      
      const categoryMapping = {
        'cleaning': 'cleaning',
        'electrical': 'electrical', 
        'plumbing': 'plumbing',
        'carpentry': 'carpentry',
        'painting': 'painting',
        'gardening': 'gardening',
        'movers': 'moving'
      };
      
      const searchCategory = categoryMapping[category.id] || category.id;
      console.log(`🔍 Searching for '${searchCategory}' providers in '${location.area}'`);
      
      // Primary: Find through ProviderService model
      const availableServices = await ProviderService.find({
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
          providerStatus: 'approved'
        },
        select: 'name email providerProfile'
      })
      .limit(10);

      // Filter valid services with providers
      const validServices = availableServices.filter(service => service.providerId);
      
      console.log(`✅ Found ${validServices.length} available services`);

      if (validServices.length > 0) {
        // Smart provider selection based on multiple factors
        const bestService = selectBestProvider(validServices, {
          location: location.area,
          urgency,
          time
        });
        
        assignedProvider = bestService.providerId._id;
        assignedService = bestService._id;
        providerAssignmentMethod = 'smart-matching';
        
        console.log(`🏆 Selected provider: ${bestService.providerId.name} with service: ${bestService.title}`);
      } else {
        // Fallback: Search by skills
        console.log('🔄 No ProviderService matches, trying skill-based assignment...');
        
        const skillKeywords = {
          'cleaning': ['cleaning', 'house cleaning'],
          'electrical': ['electrical', 'wiring'],
          'plumbing': ['plumbing', 'pipe repair'],
          'carpentry': ['carpentry', 'furniture'],
          'painting': ['painting', 'interior painting'],
          'gardening': ['gardening', 'landscaping'],
          'movers': ['moving', 'relocation']
        };

        const searchKeywords = skillKeywords[searchCategory] || [searchCategory];
        
        const fallbackProvider = await User.findOne({
          userType: 'provider',
          providerStatus: 'approved',
          'providerProfile.skills': { 
            $in: searchKeywords.map(keyword => new RegExp(keyword, 'i'))
          }
        }).select('name email providerProfile');

        if (fallbackProvider) {
          // Create a generic service entry for this provider
          const genericService = await ProviderService.create({
            providerId: fallbackProvider._id,
            title: `${category.name || searchCategory} Service`,
            description: `Professional ${searchCategory} service`,
            category: searchCategory,
            price: totalAmount || 3000,
            priceType: 'fixed',
            isActive: true
          });

          assignedProvider = fallbackProvider._id;
          assignedService = genericService._id;
          providerAssignmentMethod = 'skill-fallback';
          
          console.log(`🎯 Fallback assignment: ${fallbackProvider.name}`);
        }
      }
    }

    // Ensure we have a valid provider assignment
    if (!assignedProvider || !assignedService) {
      console.log('❌ No providers available for assignment');
      return next(new AppError(`No ${category.name || 'service'} providers available in ${location.area}. Please try a different area or contact support.`, 400));
    }

    // Step 2: Create booking with enhanced data structure
    const bookingData = {
      bookingNumber,
      client: req.user.id,
      provider: assignedProvider,
      service: assignedService,
      serviceType: 'ProviderService',
      scheduledDate: new Date(date),
      scheduledTime: {
        start: time,
        end: calculateEndTime(time, 2) // Default 2 hours
      },
      location: {
        address: location.address || `${location.area}, Nairobi`,
        coordinates: {
          lat: location.coordinates?.lat || -1.2921,
          lng: location.coordinates?.lng || 36.8219
        }
      },
      pricing: {
        basePrice: totalAmount || 3000,
        totalAmount: totalAmount || 3000,
        currency: 'KES'
      },
      payment: {
        method: paymentMethod === 'mobile-money' ? 'mpesa' : paymentMethod,
        status: paymentTiming === 'pay-now' ? 'completed' : 'pending'
      },
      notes: {
        client: description || ''
      },
      // Enhanced metadata
      metadata: {
        providerAssignmentMethod,
        urgency,
        providersNeeded,
        categoryRequested: category.id,
        locationRequested: location.area,
        paymentTiming,
        createdVia: 'enhanced-booking-v2'
      }
    };
    
    console.log('📝 Enhanced booking data:', JSON.stringify(bookingData, null, 2));

    // Step 3: Create booking
    const booking = await Booking.create(bookingData);
    console.log('✅ Enhanced booking created:', booking._id);

    // Step 4: Populate the booking with full details
    await booking.populate([
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone userType providerProfile' },
      { path: 'service', select: 'title category price priceType description' }
    ]);

    // Step 5: Send notifications
    try {
      console.log('📧 Sending enhanced booking notifications...');
      
      const client = booking.client;
      const provider = booking.provider;
      const service = booking.service;
      
      // Enhanced notification with better context
      await notificationService.sendEnhancedBookingConfirmation({
        booking,
        client,
        provider,
        service,
        assignmentMethod: providerAssignmentMethod
      });
      
      console.log('✅ Enhanced booking notifications sent successfully');
    } catch (emailError) {
      console.log('⚠️ Enhanced email notification failed:', emailError.message);
      // Don't fail the booking creation if email fails
    }

    // Step 6: Return success response
    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully with enhanced provider matching',
      data: {
        booking: {
          _id: booking._id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          client: booking.client,
          provider: booking.provider,
          service: booking.service,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          location: booking.location,
          pricing: booking.pricing,
          payment: booking.payment,
          metadata: booking.metadata
        }
      }
    });

  } catch (error) {
    console.error('❌ Enhanced booking creation error:', error);
    return next(new AppError(`Enhanced booking creation failed: ${error.message}`, 400));
  }
});

/**
 * Smart provider selection algorithm
 */
function selectBestProvider(services, criteria) {
  return services.reduce((best, current) => {
    const currentScore = calculateProviderScore(current, criteria);
    const bestScore = best ? calculateProviderScore(best, criteria) : 0;
    
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Calculate provider score for selection
 */
function calculateProviderScore(service, criteria) {
  const provider = service.providerId;
  const profile = provider.providerProfile || {};
  let score = 0;

  // Rating score (0-40 points)
  score += (profile.rating || 4.0) * 8;
  
  // Experience score (0-30 points)
  score += Math.min((profile.totalJobs || 0) / 10, 3) * 10;
  
  // Review count score (0-20 points)  
  score += Math.min((profile.reviewCount || 0) / 10, 2) * 10;
  
  // Service specific score (0-10 points)
  if (service.category && service.category !== 'other') {
    score += 10;
  }

  // Urgency adjustment
  if (criteria.urgency === 'urgent') {
    // Favor providers with faster response times
    score += (profile.responseTime === 'fast') ? 10 : 0;
  }

  return score;
}

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(startTime, durationHours = 2) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + durationHours;
  const endMinutes = minutes;
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

module.exports = {
  createEnhancedSimpleBooking: exports.createEnhancedSimpleBooking
};