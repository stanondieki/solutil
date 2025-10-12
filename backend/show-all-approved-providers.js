require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function showAllApprovedProviders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🌟 ALL APPROVED PROVIDERS IN SOLUTIL SYSTEM\n');

    // Get all approved providers
    const approvedProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    }).select('name email providerProfile.skills providerProfile.serviceAreas providerProfile.rating providerProfile.totalJobs');

    console.log(`📊 Found ${approvedProviders.length} APPROVED providers:\n`);

    // Show each approved provider
    for (let i = 0; i < approvedProviders.length; i++) {
      const provider = approvedProviders[i];
      const profile = provider.providerProfile || {};
      
      console.log(`${i + 1}. ✅ ${provider.name}`);
      console.log(`   📧 Email: ${provider.email}`);
      console.log(`   🔧 Skills: ${(profile.skills || []).join(', ') || 'None specified'}`);
      console.log(`   📍 Service Areas: ${(profile.serviceAreas || []).join(', ') || 'None specified'}`);
      console.log(`   ⭐ Rating: ${profile.rating || 'Not rated'}/5.0`);
      console.log(`   💼 Total Jobs: ${profile.totalJobs || 0}`);
      
      // Get their services
      const services = await ProviderService.find({ 
        providerId: provider._id,
        isActive: true 
      });
      
      console.log(`   🛠️  Services (${services.length}):`);
      if (services.length > 0) {
        services.forEach(service => {
          console.log(`      - ${service.title} (${service.category}) - KES ${service.price || 'Price TBD'}`);
        });
      } else {
        console.log(`      - No active services listed`);
      }
      console.log('');
    }

    // Show breakdown by service category
    console.log('\n📋 APPROVED PROVIDERS BY SERVICE CATEGORY:\n');

    const categories = ['cleaning', 'electrical', 'plumbing', 'carpentry', 'painting', 'gardening'];
    
    for (const category of categories) {
      console.log(`🔧 ${category.toUpperCase()} PROVIDERS:`);
      
      // Find providers with services in this category
      const categoryServices = await ProviderService.find({
        category: new RegExp(category, 'i'),
        isActive: true
      }).populate({
        path: 'providerId',
        match: { 
          userType: 'provider',
          providerStatus: 'approved'
        },
        select: 'name email providerProfile'
      });

      const validCategoryServices = categoryServices.filter(service => service.providerId);
      
      if (validCategoryServices.length > 0) {
        validCategoryServices.forEach(service => {
          const provider = service.providerId;
          const rating = provider.providerProfile?.rating || 4.0;
          console.log(`   ✅ ${provider.name} - ${service.title} (${rating}/5.0 ⭐)`);
        });
      } else {
        // Check for skill-based providers
        const skillProviders = await User.find({
          userType: 'provider',
          providerStatus: 'approved',
          'providerProfile.skills': new RegExp(category, 'i')
        }).select('name providerProfile.skills providerProfile.rating');
        
        if (skillProviders.length > 0) {
          skillProviders.forEach(provider => {
            const rating = provider.providerProfile?.rating || 4.0;
            const skills = (provider.providerProfile?.skills || []).join(', ');
            console.log(`   ✅ ${provider.name} - Skills: ${skills} (${rating}/5.0 ⭐)`);
          });
        } else {
          console.log(`   ❌ No approved providers available for ${category}`);
        }
      }
      console.log('');
    }

    // Show suspended/rejected for comparison
    console.log('\n⚠️  SUSPENDED/REJECTED PROVIDERS (EXCLUDED FROM BOOKINGS):\n');
    
    const suspendedProviders = await User.find({
      userType: 'provider',
      providerStatus: { $in: ['suspended', 'rejected', 'pending'] }
    }).select('name email providerStatus');

    if (suspendedProviders.length > 0) {
      suspendedProviders.forEach((provider, index) => {
        const statusIcon = provider.providerStatus === 'suspended' ? '❌' : 
                          provider.providerStatus === 'rejected' ? '🚫' : '⏳';
        console.log(`${index + 1}. ${statusIcon} ${provider.name} (${provider.providerStatus})`);
        console.log(`   📧 ${provider.email}`);
      });
    } else {
      console.log('✅ No suspended or rejected providers found');
    }

    console.log('\n🎯 SUMMARY:');
    console.log(`✅ ${approvedProviders.length} APPROVED providers available for booking`);
    console.log(`❌ ${suspendedProviders.length} providers excluded (suspended/rejected/pending)`);
    console.log('\n💡 The enhanced booking system ensures you can select from ANY of these approved providers,');
    console.log('   not just Kemmy! Each provider offers quality services with proper verification.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

showAllApprovedProviders();