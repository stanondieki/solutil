require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

async function checkAllBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bookings to see what exists
    const allBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('client', 'name email userType')
      .populate('provider', 'name email userType');

    console.log(`\n📋 All bookings in system (${allBookings.length}):`);
    
    allBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. ${booking.bookingNumber} (${booking.status})`);
      console.log(`   Client: ${booking.client?.name} (${booking.client?.email}) - ${booking.client?.userType}`);
      console.log(`   Provider: ${booking.provider?.name || 'NULL'} (${booking.provider?.email || 'NULL'}) - ${booking.provider?.userType || 'NULL'}`);
      console.log(`   Service: ${booking.service} (${booking.serviceType})`);
      console.log(`   Created: ${booking.createdAt}`);
    });

    // Check specific client from screenshot
    const stanley = await User.findOne({ email: '2208048@students.kcau.ac.ke' });
    if (stanley) {
      console.log(`\n🔍 Stanley's bookings:`);
      const stanleyBookings = await Booking.find({ client: stanley._id });
      console.log(`   Found ${stanleyBookings.length} bookings for Stanley`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAllBookings();