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

    const hasValidProviderId = selectedProvider?.id || selectedProvider?._id;
    if (hasValidProviderId && hasValidProviderId !== 'temp') {
      // User selected a specific provider
      console.log('👤 User selected specific provider:', selectedProvider.name || selectedProvider.Name);
      console.log('👤 Provider ID:', selectedProvider.id || selectedProvider._id);
      console.log('👤 Service ID:', selectedProvider.serviceId || selectedProvider.service?._id);
      console.log('👤 Full selectedProvider object:', JSON.stringify(selectedProvider, null, 2));
      
      // Handle different possible field names from frontend
      const providerId = selectedProvider.id || selectedProvider._id;
      const serviceId = selectedProvider.serviceId || selectedProvider.service?._id || selectedProvider.service;
      
      if (!providerId || !serviceId) {
        console.log('❌ Invalid provider selection data');
        console.log('   Expected: { id, serviceId }');
        console.log('   Received:', { 
          id: providerId, 
          serviceId: serviceId,
          fullObject: Object.keys(selectedProvider) 
        });
        return next(new AppError('Invalid provider selection data. Please try selecting the provider again.', 400));
      }
      
      // Verify the provider and service exist
      const User = require('../models/User');
      const ProviderService = require('../models/ProviderService');
      
      const [providerExists, serviceExists] = await Promise.all([
        User.findById(providerId).select('name userType providerStatus'),
        ProviderService.findById(serviceId).select('title providerId')
      ]);
      
      if (!providerExists) {
        console.log('❌ Selected provider not found in database:', providerId);
        return next(new AppError('Selected provider not found. Please try selecting again.', 400));
      }
      
      let validService = serviceExists;
      
      if (!serviceExists) {
        console.log('⚠️ Selected service not found, checking if this is a fallback provider selection...');
        
        // Check if serviceId equals providerId (fallback scenario)
        if (serviceId === providerId) {
          console.log('🔄 Creating dynamic service for fallback provider selection...');
          
          // Create a dynamic service for this provider
          try {
            validService = await ProviderService.create({
              providerId: providerId,
              title: `${category.name || 'Service'} by ${providerExists.name}`,
              description: `Professional ${category.name || 'service'} provided by ${providerExists.name}`,
              category: category.id || 'other',
              price: totalAmount || 3000,
              priceType: 'fixed',
              duration: 120, // Default 2 hours in minutes
              location: location.area || 'Nairobi',
              isActive: true,
              createdFromFallback: true
            });
            
            console.log('✅ Dynamic service created:', validService.title);
            assignedService = validService._id;
          } catch (serviceCreationError) {
            console.log('❌ Failed to create dynamic service:', serviceCreationError.message);
            return next(new AppError('Failed to create service for selected provider. Please try again.', 500));
          }
        } else {
          console.log('❌ Selected service not found in database:', serviceId);
          return next(new AppError('Selected service not found. Please try selecting again.', 400));
        }
      } else {
        // Verify the service belongs to the provider (for normal services)
        if (validService.providerId.toString() !== providerId.toString()) {
          console.log('❌ Service does not belong to selected provider');
          console.log('   Service provider:', validService.providerId.toString());
          console.log('   Selected provider:', providerId.toString());
          return next(new AppError('Service does not belong to selected provider. Please try again.', 400));
        }
      }
      
      assignedProvider = providerId;
      assignedService = serviceId;
      providerAssignmentMethod = 'user-selected';
      
      console.log('✅ Provider selection validated successfully');
      console.log('   Assigned Provider:', providerExists.name);
      console.log('   Assigned Service:', validService.title);
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