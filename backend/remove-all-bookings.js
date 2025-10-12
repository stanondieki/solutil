require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function removeAllBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  REMOVING ALL EXISTING BOOKINGS\n');

    // First, let's see what we have
    const existingBookings = await Booking.find()
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title category')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${existingBookings.length} existing bookings:\n`);

    if (existingBookings.length > 0) {
      // Show summary of bookings to be deleted
      console.log('📋 BOOKINGS TO BE REMOVED:');
      existingBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.bookingNumber}`);
        console.log(`   Client: ${booking.client?.name || 'Unknown'}`);
        console.log(`   Provider: ${booking.provider?.name || 'Unknown'}`);
        console.log(`   Service: ${booking.service?.title || 'Unknown'}`);
        console.log(`   Date: ${booking.scheduledDate || booking.createdAt}`);
        console.log(`   Status: ${booking.status}`);
        console.log('');
      });

      // Confirm deletion
      console.log('⚠️  WARNING: This will permanently delete ALL bookings!');
      console.log('🔄 Proceeding with deletion in 3 seconds...\n');

      // Wait 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Delete all bookings
      const deleteResult = await Booking.deleteMany({});
      
      console.log(`✅ SUCCESS: Deleted ${deleteResult.deletedCount} bookings\n`);

      // Verify deletion
      const remainingBookings = await Booking.countDocuments();
      console.log(`📊 Remaining bookings: ${remainingBookings}`);

      if (remainingBookings === 0) {
        console.log('🎉 ALL BOOKINGS SUCCESSFULLY REMOVED!');
        console.log('\n📋 BENEFITS:');
        console.log('   ✅ Clean slate for testing new booking system');
        console.log('   ✅ No more bookings with suspended providers');
        console.log('   ✅ Fresh start with enhanced provider matching');
        console.log('   ✅ All future bookings will use improved algorithm');
        console.log('\n🚀 Ready for new bookings with:');
        console.log('   • Only approved providers');
        console.log('   • Smart provider selection');
        console.log('   • Proper client-provider matching');
        console.log('   • Enhanced booking validation');
      } else {
        console.log('⚠️  Warning: Some bookings may still remain');
      }

    } else {
      console.log('✅ No existing bookings found - database is already clean!');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test new booking creation with enhanced system');
    console.log('2. Verify only approved providers are selected');
    console.log('3. Confirm client can choose specific providers like Kemmy');
    console.log('4. Validate booking creation works without errors');

  } catch (error) {
    console.error('❌ Error removing bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

removeAllBookings();