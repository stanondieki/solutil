require('dotenv').config();
const mongoose = require('mongoose');
const ProviderService = require('./models/ProviderService');
const User = require('./models/User');

async function checkOrangiServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Find Orangi's user account
    const orangi = await User.findOne({ name: 'Orangi' });
    console.log('\n🔍 Orangi provider:', {
      id: orangi._id,
      name: orangi.name,
      email: orangi.email,
      userType: orangi.userType
    });

    // Get Orangi's services
    const services = await ProviderService.find({ providerId: orangi._id });
    console.log('\n📋 Orangi\'s services available for booking:');
    
    services.forEach(service => {
      console.log(`\n🛠️  Service: ${service.title}`);
      console.log(`   ID: ${service._id}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Price: $${service.price} (${service.priceType})`);
      console.log(`   Duration: ${service.duration} minutes`);
      console.log(`   Description: ${service.description}`);
      console.log(`   Available: ${service.isActive ? 'Yes' : 'No'}`);
    });

    console.log('\n💡 To create live bookings:');
    console.log('1. Start the frontend application');
    console.log('2. Register/login as a client (not provider)');
    console.log('3. Browse available services and book Orangi\'s services');
    console.log('4. Or use the booking API directly with a client account');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrangiServices();