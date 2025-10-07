require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function debugKemmyServices() {
  try {
    const mongoURI = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    
    const kemmyProviderId = '68e4fcf48e248b993e547633';
    
    console.log('=== DEBUGGING KEMMY SERVICES ===');
    console.log('Looking for provider ID:', kemmyProviderId);
    
    // 1. Check if provider exists
    const provider = await User.findById(kemmyProviderId);
    console.log('\n1. Provider exists:', !!provider);
    if (provider) {
      console.log('   Name:', provider.name);
      console.log('   Email:', provider.email);
    }
    
    // 2. Check services in database
    const services = await ProviderService.find({ providerId: kemmyProviderId });
    console.log('\n2. Services in database:', services.length);
    services.forEach(service => {
      console.log(`   - ${service.title} (${service._id}) - Active: ${service.isActive}`);
    });
    
    // 3. Check what the enhanced API method returns
    const ProviderServiceManager = require('./utils/providerServiceManager');
    const apiServices = await ProviderServiceManager.getServicesForBooking({ limit: 50 });
    const kemmyApiServices = apiServices.filter(s => s.providerId._id.toString() === kemmyProviderId);
    console.log('\n3. Services from API method:', kemmyApiServices.length);
    kemmyApiServices.forEach(service => {
      console.log(`   - ${service.title} (${service._id}) - Provider: ${service.providerId.name || service.providerId.businessName}`);
    });
    
    // 4. Test the actual API endpoints
    console.log('\n4. Testing API endpoints...');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugKemmyServices();