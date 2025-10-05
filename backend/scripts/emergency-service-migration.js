#!/usr/bin/env node

/**
 * EMERGENCY FIX: Migrate All Onboarding Services to ProviderService Collection
 * 
 * This script will:
 * 1. Find all approved providers with onboarding services
 * 2. Convert their onboarding services to ProviderService records
 * 3. Mark services as active and available for booking
 * 
 * Run this script immediately to fix your live site!
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ProviderService = require('../models/ProviderService');

// Database connection
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/solutilconnect_db?retryWrites=true&w=majority&appName=solutilconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateServices = async () => {
  try {
    console.log('\n🚀 STARTING EMERGENCY SERVICE MIGRATION');
    console.log('=====================================');

    // Find all approved providers with services (check both locations)
    const providers = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      $or: [
        { 'onboardingData.services.0': { $exists: true } }, // Has onboarding services
        { 'providerProfile.services.0': { $exists: true } }, // Has profile services
        { 'providerProfile': { $exists: true } } // Has provider profile (we'll create default services)
      ]
    });

    console.log(`\n📊 Found ${providers.length} approved providers with onboarding services`);

    let totalServicesCreated = 0;
    let providersProcessed = 0;

    for (const provider of providers) {
      console.log(`\n👤 Processing: ${provider.email}`);
      
      // Get services from either onboarding data or provider profile
      let services = [];
      if (provider.onboardingData?.services?.length) {
        services = provider.onboardingData.services;
        console.log(`   📋 Found ${services.length} services in onboarding data`);
      } else if (provider.providerProfile?.services?.length) {
        services = provider.providerProfile.services;
        console.log(`   📋 Found ${services.length} services in provider profile`);
      } else if (provider.providerProfile) {
        // Create default services based on provider profile skills
        const skills = provider.providerProfile.skills || ['General Services'];
        const serviceAreas = provider.providerProfile.serviceAreas || ['Nairobi'];
        
        services = skills.map(skill => ({
          title: `${skill} Services`,
          description: `Professional ${skill.toLowerCase()} services by ${provider.name}`,
          category: skill.toLowerCase().replace(/\s+/g, '-'),
          pricing: {
            basePrice: provider.providerProfile.hourlyRate || 2500,
            currency: 'KES',
            priceType: 'hourly'
          },
          availability: provider.providerProfile.availability || {},
          serviceAreas: serviceAreas
        }));
        console.log(`   🔧 Created ${services.length} default services from profile skills`);
      }
      
      if (!services.length) {
        console.log(`   ⚠️  No services found - skipping`);
        continue;
      }

      let servicesCreated = 0;

      for (const service of services) {
        // Check if service already exists
        const existingService = await ProviderService.findOne({
          providerId: provider._id,
          title: service.title,
          category: service.category
        });

        if (existingService) {
          console.log(`   ⏭️  Service "${service.title}" already exists - skipping`);
          continue;
        }

        // Create ProviderService matching the exact schema
        try {
          const providerService = await ProviderService.create({
            providerId: provider._id,
            title: service.title,
            description: service.description,
            category: service.category === 'electrical' ? 'electrical' : 'other', // Map to valid enum
            price: service.pricing?.basePrice || provider.providerProfile?.hourlyRate || 2500,
            priceType: service.pricing?.priceType === 'hourly' ? 'hourly' : 'fixed',
            duration: 60, // Default 1 hour in minutes
            images: service.images || [],
            serviceArea: service.serviceAreas || provider.providerProfile?.serviceAreas || ['Nairobi'],
            availableHours: {
              start: provider.providerProfile?.availability?.hours?.start || '08:00',
              end: provider.providerProfile?.availability?.hours?.end || '18:00'
            },
            tags: [],
            isActive: true,
            totalBookings: 0,
            totalRevenue: 0,
            rating: 0,
            reviewCount: 0
          });

          servicesCreated++;
          totalServicesCreated++;
          console.log(`   ✅ Created: "${service.title}" (${service.category})`);

        } catch (serviceError) {
          console.log(`   ❌ Failed to create "${service.title}":`, serviceError.message);
        }
      }

      // Mark provider as having services activated
      await User.findByIdAndUpdate(provider._id, {
        'onboardingData.servicesActivated': true,
        'onboardingData.migrationDate': new Date()
      });

      providersProcessed++;
      console.log(`   📈 Created ${servicesCreated} services for ${provider.email}`);
    }

    console.log('\n🎉 MIGRATION COMPLETED!');
    console.log('======================');
    console.log(`✅ Providers processed: ${providersProcessed}`);
    console.log(`✅ Total services created: ${totalServicesCreated}`);
    
    // Verify results
    const activeServices = await ProviderService.countDocuments({ isActive: true });
    console.log(`📊 Total active services in database: ${activeServices}`);

    // Show sample services
    const sampleServices = await ProviderService.find({ isActive: true })
      .populate('providerId', 'businessName email')
      .limit(5);

    console.log('\n🔍 SAMPLE MIGRATED SERVICES:');
    sampleServices.forEach((service, index) => {
      console.log(`${index + 1}. "${service.title}" by ${service.providerId?.businessName || service.providerId?.email}`);
      console.log(`   Category: ${service.category} | Price: ${service.pricing.currency} ${service.pricing.basePrice}`);
    });

    console.log('\n🚨 NEXT STEPS:');
    console.log('1. Restart your backend server to load new routes');
    console.log('2. Test the new services API: GET /api/v2/services');
    console.log('3. Update your frontend to use the new API endpoints');
    console.log('4. Test booking functionality with migrated services');

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateServices();
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  runMigration();
}

module.exports = { migrateServices };