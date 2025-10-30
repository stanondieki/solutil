require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');

async function testAdminBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@solutilconnect.com' });
    console.log('👨‍💼 Admin user found:', admin ? 'Yes' : 'No');

    // Get all bookings directly from database
    const totalBookings = await Booking.countDocuments();
    console.log(`📊 Total bookings in database: ${totalBookings}`);

    if (totalBookings > 0) {
      // Get first few bookings with population
      const bookings = await Booking.find({})
        .populate('client', 'name email')
        .populate('provider', 'name email') 
        .populate('service', 'name title description')
        .sort({ createdAt: -1 })
        .limit(5);

      console.log(`\n📋 Sample bookings (${bookings.length}):`);
      bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.bookingNumber}:`);
        console.log(`   Client: ${booking.client?.name || 'NULL'} (${booking.client?.email || 'NULL'})`);
        console.log(`   Provider: ${booking.provider?.name || 'NULL'} (${booking.provider?.email || 'NULL'})`);
        console.log(`   Service: ${booking.service?.name || booking.service?.title || 'NULL'}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${booking.createdAt}`);
      });

      // Test the admin API logic
      console.log('\n🧪 Testing admin API logic...');
      const filter = {};
      const adminBookings = await Booking.find(filter)
        .populate('client', 'name email phone')
        .populate('provider', 'name email phone')
        .populate('service', 'name description title category')
        .sort({ createdAt: -1 })
        .limit(50);

      console.log(`✅ Admin API would return ${adminBookings.length} bookings`);

      if (adminBookings.length > 0) {
        const sample = adminBookings[0];
        console.log('\n📋 Sample API response structure:');
        console.log({
          _id: sample._id,
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
            description: sample.service.description
          } : null,
          status: sample.status,
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

testAdminBookings();