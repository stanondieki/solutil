require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function fixExistingBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔧 Fixing existing bookings...');

    // Get all bookings with null providers
    const brokenBookings = await Booking.find({ 
      provider: null,
      service: { $ne: null }
    });

    console.log(`Found ${brokenBookings.length} bookings with null providers but valid services`);

    let fixedCount = 0;

    for (const booking of brokenBookings) {
      console.log(`\n🔍 Fixing booking ${booking.bookingNumber}:`);
      console.log(`   Service ID: ${booking.service}`);

      // Find the ProviderService
      const providerService = await ProviderService.findById(booking.service);
      
      if (providerService) {
        console.log(`   ✅ Found service: "${providerService.title}" by provider ${providerService.providerId}`);
        
        // Update the booking with the correct provider
        await Booking.findByIdAndUpdate(booking._id, {
          provider: providerService.providerId
        });
        
        console.log(`   ✅ Updated booking with provider: ${providerService.providerId}`);
        fixedCount++;
      } else {
        console.log(`   ❌ Service not found for ID: ${booking.service}`);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} out of ${brokenBookings.length} bookings`);

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verifyBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service');

    verifyBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. ${booking.bookingNumber}:`);
      console.log(`   Client: ${booking.client?.name} ✅`);
      console.log(`   Provider: ${booking.provider?.name || 'STILL NULL'} ${booking.provider?.name ? '✅' : '❌'}`);
      console.log(`   Service: ${booking.service?.title || 'NOT FOUND'} ${booking.service?.title ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixExistingBookings();