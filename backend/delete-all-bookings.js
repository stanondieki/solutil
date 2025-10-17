require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');
const Service = require('./models/Service');

async function deleteAllBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== DELETING ALL BOOKINGS ===');
    
    // First, let's see how many bookings exist
    const bookingCount = await Booking.countDocuments();
    console.log(`📊 Found ${bookingCount} bookings in the database`);
    
    if (bookingCount === 0) {
      console.log('✅ No bookings to delete');
      return;
    }
    
    // Show some sample bookings before deletion
    console.log('\n📋 Sample bookings to be deleted:');
    const sampleBookings = await Booking.find()
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title name')
      .limit(5)
      .sort({ createdAt: -1 });
    
    sampleBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.bookingNumber}`);
      console.log(`      Client: ${booking.client?.name || 'Unknown'}`);
      console.log(`      Provider: ${booking.provider?.name || 'Unknown'}`);
      console.log(`      Service: ${booking.service?.title || booking.service?.name || 'Unknown'}`);
      console.log(`      Status: ${booking.status}`);
      console.log(`      Created: ${booking.createdAt?.toISOString().split('T')[0] || 'Unknown'}`);
      console.log('');
    });
    
    if (bookingCount > 5) {
      console.log(`   ... and ${bookingCount - 5} more bookings`);
    }
    
    // Perform the deletion
    console.log('\n🗑️ Deleting all bookings...');
    const deleteResult = await Booking.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} bookings`);
    
    // Verify deletion
    const remainingCount = await Booking.countDocuments();
    console.log(`📊 Remaining bookings: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('🎉 All bookings have been successfully deleted!');
    } else {
      console.log('⚠️ Some bookings may not have been deleted');
    }
    
  } catch (error) {
    console.error('❌ Error deleting bookings:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Add a confirmation prompt
console.log('⚠️  WARNING: This will delete ALL bookings from the database!');
console.log('📝 This action cannot be undone.');
console.log('🚀 Starting deletion in 3 seconds...');

setTimeout(() => {
  deleteAllBookings();
}, 3000);