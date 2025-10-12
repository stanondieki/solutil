require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

async function cleanTestBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Find Orangi
    const orangi = await User.findOne({ name: 'Orangi' });
    
    // Remove the test bookings I created (they have notes: 'Test booking for Orangi')
    const deletedBookings = await Booking.deleteMany({ 
      provider: orangi._id,
      notes: 'Test booking for Orangi'
    });

    console.log(`🗑️  Removed ${deletedBookings.deletedCount} test bookings`);
    console.log('✅ Ready for live booking creation');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanTestBookings();