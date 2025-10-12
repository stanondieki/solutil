require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

async function removeScriptedBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Find Orangi
    const orangi = await User.findOne({ name: 'Orangi' });
    console.log('\n🔍 Orangi provider:', {
      id: orangi._id,
      name: orangi.name,
      email: orangi.email
    });

    // Find all bookings for Orangi
    const orangiBookings = await Booking.find({ provider: orangi._id });
    console.log(`\n📋 Found ${orangiBookings.length} bookings for Orangi`);

    // Show which bookings will be removed
    orangiBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.bookingNumber} - ${booking.status} - ${booking.notes || 'No notes'}`);
    });

    // Remove all scripted bookings for Orangi
    const deleteResult = await Booking.deleteMany({ provider: orangi._id });
    console.log(`\n🗑️  Removed ${deleteResult.deletedCount} scripted bookings for Orangi`);

    // Verify removal
    const remainingBookings = await Booking.find({ provider: orangi._id });
    console.log(`\n✅ Orangi now has ${remainingBookings.length} bookings`);

    console.log('\n🎯 Ready for live booking test!');
    console.log('Next steps:');
    console.log('1. Login as a client (not provider) in the frontend');
    console.log('2. Navigate to services/browse or book-service');
    console.log('3. Find and book Orangi\'s "Lawn mowing" service');
    console.log('4. Complete the booking process');
    console.log('5. Login as Orangi to verify the booking appears');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

removeScriptedBookings();