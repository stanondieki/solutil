require('dotenv').config();
const mongoose = require('mongoose');

// Import all necessary models
const User = require('./models/User');
const Provider = require('./models/Provider'); 
const Booking = require('./models/Booking');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function testAdminAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Exact same logic as our modified admin route
    const bookings = await Booking.find({})
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50);

    console.log(`✅ Found ${bookings.length} bookings`);

    // Manual service population
    for (let booking of bookings) {
      if (booking.service && booking.serviceType === 'ProviderService') {
        try {
          const service = await ProviderService.findById(booking.service)
            .select('title category description price');
          booking.service = service;
          console.log(`✅ Populated ProviderService: ${service?.title || 'N/A'}`);
        } catch (error) {
          console.log(`⚠️ Failed to populate ProviderService: ${error.message}`);
          booking.service = null;
        }
      } else if (booking.service && booking.serviceType === 'Service') {
        try {
          const service = await Service.findById(booking.service)
            .select('name category description basePrice');
          booking.service = service;
          console.log(`✅ Populated Service: ${service?.name || 'N/A'}`);
        } catch (error) {
          console.log(`⚠️ Failed to populate Service: ${error.message}`);
          booking.service = null;
        }
      }
    }

    const totalBookings = await Booking.countDocuments({});
    console.log(`\n📊 Total bookings: ${totalBookings}`);
    console.log(`📋 Populated bookings: ${bookings.length}`);

    // Show sample data that would be sent to admin
    if (bookings.length > 0) {
      const sample = bookings[0];
      console.log('\n📄 Sample admin booking data:');
      console.log({
        bookingNumber: sample.bookingNumber,
        client: sample.client?.name || 'No client',
        provider: sample.provider?.name || 'No provider', 
        service: sample.service?.title || sample.service?.name || 'No service',
        status: sample.status,
        serviceType: sample.serviceType,
        createdAt: sample.createdAt
      });
    }

    return bookings;

  } catch (error) {
    console.error('❌ Error testing admin API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAdminAPI();