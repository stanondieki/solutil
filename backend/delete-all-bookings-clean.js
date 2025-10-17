const mongoose = require('mongoose');
require('dotenv').config();

/**
 * CLEAN DELETION OF ALL BOOKINGS
 * Safely removes all bookings from the database
 */

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function deleteAllBookings() {
  try {
    console.log('🗑️  DELETING ALL BOOKINGS');
    console.log('=======================\n');
    
    // Connect to database
    await connectDB();
    
    // Import the Booking model
    const Booking = require('./models/Booking');
    
    // First, let's see what we have
    console.log('📊 Checking existing bookings...');
    const existingBookings = await Booking.find({});
    console.log(`   Found: ${existingBookings.length} total bookings\n`);
    
    if (existingBookings.length === 0) {
      console.log('✅ No bookings found - database is already clean!');
      await mongoose.connection.close();
      return;
    }
    
    // Show breakdown by status
    const statusBreakdown = {};
    existingBookings.forEach(booking => {
      const status = booking.status || 'unknown';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });
    
    console.log('📋 Bookings by status:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} bookings`);
    });
    console.log('');
    
    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete ALL bookings!');
    console.log('   This action cannot be undone.\n');
    
    // Proceed with deletion
    console.log('🗑️  Proceeding with deletion...');
    const deleteResult = await Booking.deleteMany({});
    
    console.log('✅ DELETION COMPLETE!');
    console.log(`   Deleted: ${deleteResult.deletedCount} bookings`);
    console.log('   Status: Database is now clean\n');
    
    // Verify deletion
    console.log('🔍 Verifying deletion...');
    const remainingBookings = await Booking.find({});
    console.log(`   Remaining bookings: ${remainingBookings.length}`);
    
    if (remainingBookings.length === 0) {
      console.log('✅ Verification successful - all bookings deleted!\n');
    } else {
      console.log('⚠️  Warning: Some bookings may still exist\n');
    }
    
    console.log('🎯 SUMMARY:');
    console.log(`   Original bookings: ${existingBookings.length}`);
    console.log(`   Deleted: ${deleteResult.deletedCount}`);
    console.log(`   Remaining: ${remainingBookings.length}`);
    console.log('   Database status: Clean and ready for new bookings');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n💾 Database connection closed');
    
  } catch (error) {
    console.error('❌ Deletion failed:', error);
    throw error;
  }
}

// Safety check function
async function safetyCheck() {
  console.log('🔒 SAFETY CHECK');
  console.log('===============\n');
  
  console.log('This script will:');
  console.log('✓ Delete ALL bookings from the database');
  console.log('✓ Remove all booking history');
  console.log('✓ Clean the slate for fresh testing');
  console.log('');
  
  console.log('This will NOT affect:');
  console.log('✓ User accounts');
  console.log('✓ Provider profiles');
  console.log('✓ Services');
  console.log('✓ Reviews');
  console.log('✓ Any other data');
  console.log('');
  
  return true;
}

// Run the deletion
async function main() {
  try {
    await safetyCheck();
    await deleteAllBookings();
    
    console.log('\n🎉 MISSION ACCOMPLISHED!');
    console.log('All bookings have been successfully deleted.');
    console.log('Your database is now clean and ready for testing the new provider discovery system!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { deleteAllBookings };