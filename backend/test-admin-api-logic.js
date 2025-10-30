require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');

async function testAdminAPILogic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧪 Testing Admin API Logic with Manual Service Population...\n');

    // Simulate the admin API call
    const filter = {};
    const skip = 0;
    const limit = 50;

    // Fetch bookings first without service population (like our new code)
    const bookings = await Booking.find(filter)
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`✅ Found ${bookings.length} bookings (before service population)`);

    // Manually populate services based on serviceType
    for (let booking of bookings) {
      if (booking.service && booking.serviceType === 'ProviderService') {
        try {
          const ProviderService = require('./models/ProviderService');
          const service = await ProviderService.findById(booking.service)
            .select('title category description price');
          booking.service = service;
          console.log(`✅ Populated ProviderService for ${booking.bookingNumber}: ${service?.title || 'null'}`);
        } catch (error) {
          console.log(`⚠️ Could not populate ProviderService for booking ${booking.bookingNumber}:`, error.message);
          booking.service = null;
        }
      } else if (booking.service && booking.serviceType === 'Service') {
        try {
          const Service = require('./models/Service');
          const service = await Service.findById(booking.service)
            .select('name category description basePrice');
          booking.service = service;
          console.log(`✅ Populated Service for ${booking.bookingNumber}: ${service?.name || 'null'}`);
        } catch (error) {
          console.log(`⚠️ Could not populate Service for booking ${booking.bookingNumber}:`, error.message);
          booking.service = null;
        }
      }
    }

    console.log(`\n📊 Final Result: ${bookings.length} bookings with populated data`);

    // Show sample populated booking
    if (bookings.length > 0) {
      const sample = bookings[0];
      console.log('\n📋 Sample populated booking:');
      console.log({
        bookingNumber: sample.bookingNumber,
        client: sample.client ? {
          name: sample.client.name,
          email: sample.client.email
        } : null,
        provider: sample.provider ? {
          name: sample.provider.name,
          email: sample.provider.email
        } : null,
        service: sample.service ? {
          name: sample.service.name || sample.service.title,
          category: sample.service.category,
          description: sample.service.description
        } : null,
        status: sample.status,
        serviceType: sample.serviceType
      });
    }

    // Test the response structure that would be sent to frontend
    const responseData = {
      status: 'success',
      results: bookings.length,
      total: bookings.length,
      page: 1,
      pages: 1,
      data: {
        bookings
      }
    };

    console.log('\n✅ Admin API Response Structure:');
    console.log({
      status: responseData.status,
      results: responseData.results,
      total: responseData.total,
      hasBookings: responseData.data.bookings.length > 0,
      firstBookingHasClient: responseData.data.bookings[0]?.client?.name ? true : false,
      firstBookingHasProvider: responseData.data.bookings[0]?.provider?.name ? true : false,
      firstBookingHasService: responseData.data.bookings[0]?.service?.title || responseData.data.bookings[0]?.service?.name ? true : false
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testAdminAPILogic();