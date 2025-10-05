const ProviderService = require('../models/ProviderService');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Enhanced Provider Service Manager
 * Handles the complete lifecycle of provider services
 */
class ProviderServiceManager {
  
  /**
   * Convert onboarding services to ProviderServices when provider is approved
   * @param {Object} provider - The provider user object
   * @returns {Array} Created ProviderService records
   */
  static async activateProviderServices(provider) {
    try {
      if (!provider.onboardingData?.services?.length) {
        logger.warn(`No onboarding services found for provider: ${provider.email}`);
        return [];
      }

      const createdServices = [];

      for (const service of provider.onboardingData.services) {
        // Check if service already exists
        const existingService = await ProviderService.findOne({
          providerId: provider._id,
          title: service.title,
          category: service.category
        });

        if (existingService) {
          logger.info(`Service already exists: ${service.title} for ${provider.email}`);
          continue;
        }

        // Create ProviderService from onboarding data
        const providerService = new ProviderService({
          providerId: provider._id,
          title: service.title,
          description: service.description,
          category: service.category,
          subCategory: service.subCategory,
          pricing: {
            basePrice: service.pricing?.basePrice || 0,
            currency: service.pricing?.currency || 'USD',
            priceType: service.pricing?.priceType || 'fixed',
            hourlyRate: service.pricing?.hourlyRate,
            customRates: service.pricing?.customRates || []
          },
          availability: {
            schedule: service.availability?.schedule || {},
            timeSlots: service.availability?.timeSlots || [],
            blackoutDates: service.availability?.blackoutDates || []
          },
          serviceArea: {
            type: service.serviceArea?.type || 'radius',
            radius: service.serviceArea?.radius || 25,
            specificAreas: service.serviceArea?.specificAreas || [],
            coordinates: provider.location?.coordinates || [0, 0]
          },
          requirements: service.requirements || [],
          images: service.images || [],
          isActive: true,
          isVerified: false, // Will need admin verification
          createdAt: new Date(),
          metadata: {
            source: 'onboarding',
            migrationDate: new Date()
          }
        });

        await providerService.save();
        createdServices.push(providerService);
        
        logger.info(`✅ Activated service: ${service.title} for provider: ${provider.email}`);
      }

      // Update provider status to indicate services are activated
      await User.findByIdAndUpdate(provider._id, {
        'onboardingData.servicesActivated': true,
        'onboardingData.activationDate': new Date()
      });

      return createdServices;

    } catch (error) {
      logger.error(`Error activating services for ${provider.email}:`, error);
      throw error;
    }
  }

  /**
   * Get all active services for a provider
   * @param {String} providerId - The provider ID
   * @returns {Array} Active ProviderService records
   */
  static async getProviderServices(providerId) {
    try {
      return await ProviderService.find({
        providerId,
        isActive: true
      }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error(`Error fetching services for provider ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Get services for booking system (with provider details)
   * @param {Object} filters - Search filters
   * @returns {Array} Services with provider information
   */
  static async getServicesForBooking(filters = {}) {
    try {
      const query = { isActive: true };
      
      // Apply filters
      if (filters.category) query.category = filters.category;
      if (filters.location) {
        // Add geospatial query for location-based search
        query['serviceArea.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: filters.location.coordinates
            },
            $maxDistance: filters.location.radius * 1000 // Convert km to meters
          }
        };
      }
      if (filters.priceRange) {
        query['pricing.basePrice'] = {
          $gte: filters.priceRange.min || 0,
          $lte: filters.priceRange.max || 999999
        };
      }

      return await ProviderService.find(query)
        .populate('providerId', 'businessName email phone rating location profilePicture')
        .sort({ 'rating.average': -1, createdAt: -1 })
        .limit(filters.limit || 20);

    } catch (error) {
      logger.error('Error fetching services for booking:', error);
      throw error;
    }
  }

  /**
   * Deactivate a service
   * @param {String} serviceId - The service ID
   * @param {String} providerId - The provider ID (for security)
   * @returns {Object} Updated service
   */
  static async deactivateService(serviceId, providerId) {
    try {
      return await ProviderService.findOneAndUpdate(
        { _id: serviceId, providerId },
        { isActive: false, deactivatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error deactivating service ${serviceId}:`, error);
      throw error;
    }
  }
}

module.exports = ProviderServiceManager;