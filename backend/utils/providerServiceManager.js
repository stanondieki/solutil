const ProviderService = require('../models/ProviderService');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Enhanced Provider Service Manager
 * Handles the complete lifecycle of provider services
 */
class ProviderServiceManager {
  
  /**
   * Convert provider profile services to ProviderServices when provider is approved
   * @param {Object} provider - The provider user object
   * @returns {Array} Created ProviderService records
   */
  static async activateProviderServices(provider) {
    try {
      const createdServices = [];

      // Define skill to category mapping
      const skillCategoryMap = {
        'Electrical': 'electrical',
        'Plumbing': 'plumbing',
        'Cleaning': 'cleaning',
        'Carpentry': 'carpentry',
        'Painting': 'painting',
        'Gardening': 'gardening'
      };

      // Check for services in multiple locations (migration compatibility)
      let servicesToCreate = [];
      let skillsToCreate = [];

      // 1. Check providerProfile.services (new structure)
      if (provider.providerProfile?.services?.length) {
        servicesToCreate = provider.providerProfile.services;
        logger.info(`Found ${servicesToCreate.length} services in providerProfile for ${provider.email}`);
      }
      
      // 2. Check onboardingData.services (legacy structure) 
      else if (provider.onboardingData?.services?.length) {
        servicesToCreate = provider.onboardingData.services;
        logger.info(`Found ${servicesToCreate.length} services in onboardingData for ${provider.email}`);
      }

      // 3. Check providerProfile.skills (create default services from skills)
      if (provider.providerProfile?.skills?.length) {
        skillsToCreate = provider.providerProfile.skills;
        logger.info(`Found ${skillsToCreate.length} skills in providerProfile for ${provider.email}`);
      }
      
      // 4. Check profile.skills (legacy location)
      else if (provider.profile?.skills?.length) {
        skillsToCreate = provider.profile.skills;
        logger.info(`Found ${skillsToCreate.length} skills in profile for ${provider.email}`);
      }

      // Create services from explicit service definitions
      for (const service of servicesToCreate) {
        const category = skillCategoryMap[service.category] || service.category?.toLowerCase() || 'other';
        
        // Check if service already exists
        const existingService = await ProviderService.findOne({
          providerId: provider._id,
          title: service.title,
          category: category
        });

        if (existingService) {
          logger.info(`Service already exists: ${service.title} for ${provider.email}`);
          continue;
        }

        // Create ProviderService from service data
        const serviceData = {
          providerId: provider._id,
          title: service.title,
          description: service.description || `Professional ${service.category?.toLowerCase()} service by ${provider.name}`,
          category: category,
          price: service.price || provider.providerProfile?.hourlyRate || 2000,
          priceType: service.priceType || 'fixed',
          duration: 60, // Default 1 hour
          serviceArea: provider.providerProfile?.serviceAreas || ['Nairobi'],
          availableHours: {
            start: provider.providerProfile?.availability?.hours?.start || '09:00',
            end: provider.providerProfile?.availability?.hours?.end || '17:00'
          },
          isActive: true,
          tags: ['professional', 'verified'],
          metadata: {
            source: 'providerProfile',
            activationDate: new Date()
          }
        };

        const providerService = new ProviderService(serviceData);
        await providerService.save();
        createdServices.push(providerService);
        
        logger.info(`✅ Activated service: ${service.title} for provider: ${provider.email}`);
      }

      // Create services from skills (if no explicit services exist)
      for (const skill of skillsToCreate) {
        const category = skillCategoryMap[skill] || 'other';
        
        // Check if we already created a service for this category
        const existingService = await ProviderService.findOne({
          providerId: provider._id,
          category: category
        });

        if (existingService) {
          logger.info(`Service already exists for skill ${skill} for ${provider.email}`);
          continue;
        }

        // Create ProviderService from skill
        const serviceData = {
          providerId: provider._id,
          title: `${skill} Services`,
          description: `Professional ${skill.toLowerCase()} services by ${provider.name}. ${provider.providerProfile?.bio || ''}`.trim(),
          category: category,
          price: provider.providerProfile?.hourlyRate || 2000,
          priceType: 'hourly',
          duration: 60, // Default 1 hour
          serviceArea: provider.providerProfile?.serviceAreas || ['Nairobi'],
          availableHours: {
            start: provider.providerProfile?.availability?.hours?.start || '09:00',
            end: provider.providerProfile?.availability?.hours?.end || '17:00'
          },
          isActive: true,
          tags: ['professional', 'skill-based'],
          metadata: {
            source: 'skill',
            skill: skill,
            activationDate: new Date()
          }
        };

        const providerService = new ProviderService(serviceData);
        await providerService.save();
        createdServices.push(providerService);
        
        logger.info(`✅ Created service from skill: ${skill} for provider: ${provider.email}`);
      }

      if (createdServices.length === 0) {
        logger.warn(`No services could be created for provider: ${provider.email} - no skills or services found`);
      }

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