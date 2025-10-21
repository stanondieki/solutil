const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

/**
 * Debug Script: Check Provider Profile Pictures in Database
 * This script checks if providers actually have profile pictures stored
 */

async function checkProviderProfilePictures() {
  try {
    console.log('🔍 Connecting to database...');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://solutil:solutilmongodb2024@cluster0.2p0wc.mongodb.net/solutil?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    
    // Check all providers
    const providers = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    }).select('name email profilePicture providerProfile').limit(10);
    
    console.log(`\n📋 Found ${providers.length} approved providers:`);
    
    providers.forEach((provider, index) => {
      console.log(`\n👤 Provider ${index + 1}: ${provider.name}`);
      console.log(`   Email: ${provider.email}`);
      console.log(`   Profile Picture: ${provider.profilePicture || 'NOT SET'}`);
      console.log(`   Provider Profile Picture: ${provider.providerProfile?.profilePicture || 'NOT SET'}`);
      console.log(`   Provider Avatar: ${provider.providerProfile?.avatar || 'NOT SET'}`);
      console.log(`   Business Logo: ${provider.providerProfile?.businessLogo || 'NOT SET'}`);
      
      const hasAnyPicture = provider.profilePicture || 
                           provider.providerProfile?.profilePicture || 
                           provider.providerProfile?.avatar || 
                           provider.providerProfile?.businessLogo;
      
      console.log(`   Status: ${hasAnyPicture ? '✅ HAS PROFILE PICTURE' : '❌ NO PROFILE PICTURE'}`);
    });
    
    // Check provider services
    console.log('\n\n🛠️ Checking Provider Services:');
    const services = await ProviderService.find({ isActive: true })
      .populate({
        path: 'providerId',
        select: 'name profilePicture providerProfile'
      })
      .limit(5);
    
    services.forEach((service, index) => {
      const provider = service.providerId;
      if (provider) {
        console.log(`\n🔧 Service ${index + 1}: ${service.title} by ${provider.name}`);
        console.log(`   Provider Picture: ${provider.profilePicture || 'NOT SET'}`);
        console.log(`   Provider Profile Picture: ${provider.providerProfile?.profilePicture || 'NOT SET'}`);
      }
    });
    
    // Summary statistics
    const totalProviders = providers.length;
    const providersWithPictures = providers.filter(p => 
      p.profilePicture || 
      p.providerProfile?.profilePicture || 
      p.providerProfile?.avatar || 
      p.providerProfile?.businessLogo
    ).length;
    
    console.log(`\n📊 Summary Statistics:`);
    console.log(`   Total Approved Providers: ${totalProviders}`);
    console.log(`   Providers with Pictures: ${providersWithPictures}`);
    console.log(`   Providers without Pictures: ${totalProviders - providersWithPictures}`);
    console.log(`   Coverage: ${Math.round((providersWithPictures / totalProviders) * 100)}%`);
    
    if (providersWithPictures === 0) {
      console.log(`\n⚠️ NO PROVIDERS HAVE PROFILE PICTURES!`);
      console.log(`   This explains why the frontend is showing fallback avatars.`);
      console.log(`   Providers need to upload profile pictures for the enhancement to work.`);
    } else {
      console.log(`\n✅ Found providers with profile pictures!`);
      console.log(`   The profile picture enhancement should be working for these providers.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking provider profile pictures:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔒 Disconnected from MongoDB');
  }
}

// Run the check
checkProviderProfilePictures();