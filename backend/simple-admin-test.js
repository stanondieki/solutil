require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');

async function simpleAdminBookingTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bookings without population first
    const totalBookings = await Booking.countDocuments();
    console.log(`📊 Total bookings in database: ${totalBookings}`);

    if (totalBookings > 0) {
      // Get first few bookings WITHOUT population to avoid schema issues
      const bookings = await Booking.find({})
        .sort({ createdAt: -1 })
        .limit(5);

      console.log(`\n📋 Raw bookings (${bookings.length}):`);
      bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.bookingNumber}:`);
        console.log(`   Client ID: ${booking.client}`);
        console.log(`   Provider ID: ${booking.provider}`);
        console.log(`   Service ID: ${booking.service}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log(`   Service Type: ${booking.serviceType}`);
      });

      // Test what the admin API should return (raw data)
      console.log('\n🧪 Testing admin API logic (without population)...');
      const filter = {};
      const adminBookings = await Booking.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      console.log(`✅ Admin API would return ${adminBookings.length} raw bookings`);

      // Check if we have any null references
      const bookingsWithNullClient = adminBookings.filter(b => !b.client);
      const bookingsWithNullProvider = adminBookings.filter(b => !b.provider);
      const bookingsWithNullService = adminBookings.filter(b => !b.service);

      console.log('\n🔍 Reference integrity check:');
      console.log(`   Bookings with null client: ${bookingsWithNullClient.length}`);
      console.log(`   Bookings with null provider: ${bookingsWithNullProvider.length}`);
      console.log(`   Bookings with null service: ${bookingsWithNullService.length}`);

      if (adminBookings.length > 0) {
        const sample = adminBookings[0];
        console.log('\n📋 Sample raw booking structure:');
        console.log({
          _id: sample._id,
          bookingNumber: sample.bookingNumber,
          client: sample.client,
          provider: sample.provider,
          service: sample.service,
          serviceType: sample.serviceType,
          status: sample.status,
          pricing: sample.pricing,
          location: sample.location,
          createdAt: sample.createdAt
        });
      }
    } else {
      console.log('ℹ️ No bookings found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

simpleAdminBookingTest();