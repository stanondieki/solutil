require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function testOtherProvider() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Test with provider who has bookings: 68e4fcf48e248b993e547633
    const providerId = '68e4fcf48e248b993e547633';
    
    const provider = await User.findById(providerId);
    console.log('\n🔍 Testing provider:', {
      id: provider._id,
      name: provider.name,
      email: provider.email,
      userType: provider.userType
    });

    // Get their services
    const providerServices = await ProviderService.find({ provider: providerId });
    const serviceIds = providerServices.map(ps => ps._id);
    
    console.log('\n📋 Provider services:', providerServices.length);
    providerServices.forEach(service => {
      console.log(`  - ${service.name} (${service._id})`);
    });

    // Test our current query (service-based filtering)
    const serviceBasedBookings = await Booking.find({
      service: { $in: serviceIds },
      serviceType: 'ProviderService'
    });

    console.log('\n📊 Service-based bookings:', serviceBasedBookings.length);
    serviceBasedBookings.forEach(booking => {
      console.log(`  - ${booking.bookingNumber}: ${booking.status} (service: ${booking.service})`);
    });

    // Also test direct provider query
    const directBookings = await Booking.find({ provider: providerId });
    console.log('\n📊 Direct provider bookings:', directBookings.length);
    directBookings.forEach(booking => {
      console.log(`  - ${booking.bookingNumber}: ${booking.status} (provider: ${booking.provider})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testOtherProvider();