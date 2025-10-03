const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');
require('dotenv').config();

async function testProvidersQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Simulate the exact same query as the API
    let filter = { 
      userType: 'provider', 
      providerStatus: 'approved' 
    };

    let query = User.find(filter)
      .select('name email profilePicture avatar providerProfile providerStatus createdAt')
      .sort({ 'providerProfile.rating': -1, createdAt: -1 });

    const providers = await query;
    
    console.log('🔍 Query Results:');
    console.log(`Found ${providers.length} providers`);
    
    const mappedProviders = await Promise.all(providers.map(async (provider) => {
      const providerInfo = provider.providerProfile || {};
      
      console.log(`\n📋 Provider: ${provider.name}`);
      console.log(`   avatar field:`, provider.avatar);
      console.log(`   profilePicture field:`, provider.profilePicture);
      console.log(`   avatar.url:`, provider.avatar?.url);
      
      // Fetch provider's services
      let providerServices = [];
      try {
        providerServices = await ProviderService.find({
          providerId: provider._id,
          isActive: true
        }).select('title description category price priceType duration images').limit(5);
      } catch (error) {
        console.error(`Error fetching services for provider ${provider._id}:`, error);
      }
      
      return {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        profilePicture: provider.avatar?.url || provider.profilePicture || null,
        providerProfile: {
          experience: providerInfo.experience,
          skills: providerInfo.skills || [],
          hourlyRate: providerInfo.hourlyRate,
          availability: providerInfo.availability,
          serviceAreas: providerInfo.serviceAreas || [],
          bio: providerInfo.bio,
          completedJobs: providerInfo.completedJobs || 0,
          rating: providerInfo.rating || 0,
          reviewCount: providerInfo.reviewCount || 0,
          services: providerInfo.services || []
        },
        services: providerServices,
        providerStatus: provider.providerStatus,
        createdAt: provider.createdAt
      };
    }));
    
    console.log('\n📤 Final mapped data:');
    console.log(JSON.stringify(mappedProviders, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testProvidersQuery();