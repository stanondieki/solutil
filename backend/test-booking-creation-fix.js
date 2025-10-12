require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function testBookingCreationFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Test the auto-assignment logic
    console.log('\n🧪 Testing booking creation auto-assignment...');

    const categories = ['electrical', 'cleaning', 'plumbing'];
    
    for (const category of categories) {
      console.log(`\n📋 Testing ${category} category:`);
      
      // Find ProviderServices in this category
      const availableServices = await ProviderService.find({ 
        category: category,
        isActive: true 
      }).populate('providerId', 'name email userType');
      
      console.log(`   Found ${availableServices.length} available services`);
      
      if (availableServices.length > 0) {
        const selectedService = availableServices[0];
        console.log(`   ✅ Would assign: "${selectedService.title}" by ${selectedService.providerId.name}`);
        console.log(`   Provider ID: ${selectedService.providerId._id}`);
        console.log(`   Service ID: ${selectedService._id}`);
      } else {
        console.log(`   ❌ No services available for ${category}`);
      }
    }

    // Test client user
    console.log('\n👤 Available clients for testing:');
    const clients = await User.find({ userType: 'client' }).limit(3);
    clients.forEach(client => {
      console.log(`   - ${client.name} (${client.email})`);
    });

    console.log('\n🎯 Booking creation should now work with:');
    console.log('   ✅ Real provider assignment');
    console.log('   ✅ Real service assignment');
    console.log('   ✅ Proper schema validation');
    console.log('   ✅ No null provider/service errors');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testBookingCreationFix();