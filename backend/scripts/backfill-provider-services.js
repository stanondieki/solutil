const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');
const logger = require('./utils/logger');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Helper function to create a single provider service
const createProviderService = async (provider, service) => {
  try {
    // Check if service already exists to avoid duplicates
    const existingService = await ProviderService.findOne({
      providerId: provider._id,
      title: service.title,
      category: service.category
    });

    if (existingService) {
      console.log(`Service already exists: ${service.title} for provider: ${provider.email}`);
      return existingService;
    }

    // Create ProviderService from onboarding service data
    const providerService = new ProviderService({
      title: service.title,
      description: service.description || `Professional ${service.category} service by ${provider.name}`,
      category: service.category.toLowerCase(),
      price: parseFloat(service.price) || provider.providerProfile?.hourlyRate || 1000,
      priceType: service.priceType || 'hourly',
      duration: 60,
      images: [],
      isActive: true,
      serviceArea: provider.providerProfile?.serviceAreas || ['nairobi'],
      availableHours: {
        start: provider.providerProfile?.availability?.hours?.start || '08:00',
        end: provider.providerProfile?.availability?.hours?.end || '18:00'
      },
      tags: [service.category, 'professional', 'verified'],
      providerId: provider._id,
      totalBookings: 0,
      totalRevenue: 0,
      rating: 0,
      reviewCount: 0
    });

    await providerService.save();
    console.log(`✅ Created ProviderService: ${service.title} for provider: ${provider.email}`);
    return providerService;

  } catch (error) {
    console.error(`❌ Error creating service ${service.title} for provider ${provider.email}:`, error);
    return null;
  }
};

// Convert onboarding services to provider services
const convertOnboardingServicesToProviderServices = async (provider) => {
  const onboardingServices = provider.providerProfile?.services;
  
  if (!onboardingServices || !Array.isArray(onboardingServices) || onboardingServices.length === 0) {
    console.log(`No onboarding services found for provider: ${provider.email}, creating default service`);
    
    // Create a default service based on provider's main skill/category
    const mainSkill = provider.providerProfile?.skills?.[0] || 'general';
    const defaultService = {
      title: `${mainSkill.charAt(0).toUpperCase() + mainSkill.slice(1)} Services`,
      category: mainSkill.toLowerCase(),
      price: provider.providerProfile?.hourlyRate || 1000,
      priceType: 'hourly',
      description: `Professional ${mainSkill} services by ${provider.name}`
    };
    
    await createProviderService(provider, defaultService);
    return;
  }

  console.log(`Converting ${onboardingServices.length} onboarding services for provider: ${provider.email}`);

  for (const service of onboardingServices) {
    await createProviderService(provider, service);
  }
};

// Main backfill function
const backfillServices = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting service backfill for approved providers...');
    
    // Get all approved providers
    const approvedProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    });

    console.log(`📊 Found ${approvedProviders.length} approved providers`);

    let processedCount = 0;
    let servicesCreated = 0;

    for (const provider of approvedProviders) {
      try {
        console.log(`\n🔄 Processing provider: ${provider.email}`);
        
        // Check if provider already has services
        const existingServicesCount = await ProviderService.countDocuments({ 
          providerId: provider._id 
        });

        console.log(`   Existing services: ${existingServicesCount}`);

        if (existingServicesCount === 0) {
          console.log(`   Creating services for ${provider.email}...`);
          await convertOnboardingServicesToProviderServices(provider);
          
          // Count services created
          const newServicesCount = await ProviderService.countDocuments({ 
            providerId: provider._id 
          });
          
          console.log(`   ✅ Created ${newServicesCount} services for ${provider.email}`);
          servicesCreated += newServicesCount;
        } else {
          console.log(`   ⏭️  Provider ${provider.email} already has services, skipping`);
        }
        
        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing provider ${provider.email}:`, error);
      }
    }

    console.log(`\n🎉 Backfill completed!`);
    console.log(`📊 Providers processed: ${processedCount}`);
    console.log(`📦 Services created: ${servicesCreated}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  backfillServices();
}

module.exports = { backfillServices };