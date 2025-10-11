const User = require('../models/User');
const ProviderService = require('../models/ProviderService');
const logger = require('../utils/logger');

class ProviderMatchingService {
  /**
   * Find available providers for a service booking
   * @param {Object} bookingData - The booking data
   * @returns {Array} - Array of matched providers
   */
  async findAvailableProviders(bookingData) {
    try {
      const { category, location, urgency, scheduledDate, scheduledTime } = bookingData;
      
      // Build query to find providers
      const query = {
        userType: 'provider',
        'providerProfile.isVerified': true,
        'providerProfile.isActive': true
      };
      
      // Find providers with matching services if category is specified
      let providerServices = [];
      if (category?.name) {
        providerServices = await ProviderService.find({
          category: { $regex: category.name, $options: 'i' },
          isActive: true
        }).populate('provider', '_id name email phone providerProfile');
      }
      
      // Get all active providers if no specific service match
      let allProviders = await User.find(query)
        .select('_id name email phone providerProfile location');
      
      // Combine and deduplicate providers
      const providerMap = new Map();
      
      // Add service-specific providers first (higher priority)
      providerServices.forEach(service => {
        if (service.provider && service.provider._id) {
          providerMap.set(service.provider._id.toString(), {
            ...service.provider.toObject(),
            matchType: 'service',
            service: service.title
          });
        }
      });
      
      // Add general providers if we don't have enough service-specific ones
      allProviders.forEach(provider => {
        const id = provider._id.toString();
        if (!providerMap.has(id)) {
          providerMap.set(id, {
            ...provider.toObject(),
            matchType: 'general'
          });
        }
      });
      
      let availableProviders = Array.from(providerMap.values());
      
      // Score and sort providers based on various factors
      availableProviders = this.scoreProviders(availableProviders, bookingData);
      
      // Apply availability filters
      availableProviders = await this.filterByAvailability(availableProviders, scheduledDate, scheduledTime);
      
      // Limit to top matches
      return availableProviders.slice(0, 10);
      
    } catch (error) {
      logger.error('Error finding available providers:', error);
      return [];
    }
  }
  
  /**
   * Score providers based on matching criteria
   * @param {Array} providers - Array of providers
   * @param {Object} bookingData - Booking data for scoring
   * @returns {Array} - Scored and sorted providers
   */
  scoreProviders(providers, bookingData) {
    return providers.map(provider => {
      let score = 0;
      
      // Service match bonus
      if (provider.matchType === 'service') {
        score += 50;
      }
      
      // Rating bonus
      if (provider.providerProfile?.rating) {
        score += provider.providerProfile.rating * 10;
      }
      
      // Experience bonus
      if (provider.providerProfile?.totalJobs) {
        score += Math.min(provider.providerProfile.totalJobs, 20);
      }
      
      // Verification bonus
      if (provider.providerProfile?.isVerified) {
        score += 20;
      }
      
      // Location proximity bonus (simplified - would use actual distance calculation)
      if (bookingData.location?.area && provider.location?.area) {
        if (provider.location.area.toLowerCase() === bookingData.location.area.toLowerCase()) {
          score += 30;
        }
      }
      
      // Urgency handling - prefer providers with faster response times
      if (bookingData.urgency === 'urgent' || bookingData.urgency === 'emergency') {
        if (provider.providerProfile?.avgResponseTime && provider.providerProfile.avgResponseTime < 30) {
          score += 25;
        }
      }
      
      return { ...provider, score };
    }).sort((a, b) => b.score - a.score);
  }
  
  /**
   * Filter providers by availability
   * @param {Array} providers - Array of providers
   * @param {String} date - Scheduled date
   * @param {Object} time - Scheduled time
   * @returns {Array} - Available providers
   */
  async filterByAvailability(providers, date, time) {
    // Simplified availability check
    // In a real system, you'd check against provider calendars, existing bookings, etc.
    
    const Booking = require('../models/Booking');
    
    const availableProviders = [];
    
    for (const provider of providers) {
      // Check if provider has conflicting bookings
      const conflictingBookings = await Booking.find({
        provider: provider._id,
        scheduledDate: new Date(date),
        status: { $in: ['confirmed', 'in_progress'] },
        'scheduledTime.start': time.start
      });
      
      if (conflictingBookings.length === 0) {
        availableProviders.push(provider);
      }
    }
    
    return availableProviders;
  }
  
  /**
   * Auto-assign best provider to a booking
   * @param {Object} booking - The booking object
   * @returns {Object} - Updated booking with assigned provider
   */
  async autoAssignProvider(booking) {
    try {
      const availableProviders = await this.findAvailableProviders(booking);
      
      if (availableProviders.length > 0) {
        const bestProvider = availableProviders[0];
        
        // Update booking with assigned provider
        const Booking = require('../models/Booking');
        const updatedBooking = await Booking.findByIdAndUpdate(
          booking._id,
          { 
            provider: bestProvider._id,
            status: 'confirmed',
            assignedAt: new Date()
          },
          { new: true }
        ).populate([
          { path: 'client', select: 'name email phone' },
          { path: 'provider', select: 'name email phone userType providerProfile' }
        ]);
        
        logger.info(`Auto-assigned provider ${bestProvider.name} to booking ${booking.bookingNumber}`);
        
        return {
          success: true,
          booking: updatedBooking,
          provider: bestProvider
        };
      }
      
      return {
        success: false,
        message: 'No available providers found'
      };
      
    } catch (error) {
      logger.error('Error auto-assigning provider:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ProviderMatchingService();