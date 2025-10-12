require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function fixBrokenReferences() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get recent bookings
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`\n🔍 Checking ${recentBookings.length} recent bookings...`);

    for (const booking of recentBookings) {
      console.log(`\n📋 Booking ${booking.bookingNumber}:`);
      
      // Check if provider exists
      const provider = await User.findById(booking.provider);
      console.log(`   Provider ${booking.provider}: ${provider ? `✅ ${provider.name}` : '❌ NOT FOUND'}`);
      
      // Check if service exists  
      const service = await ProviderService.findById(booking.service);
      console.log(`   Service ${booking.service}: ${service ? `✅ ${service.title}` : '❌ NOT FOUND'}`);
      
      // If service doesn't exist, try to assign a real service
      if (!service && provider) {
        console.log('   🔧 Trying to assign real service...');
        
        // Find any service by this provider
        const providerServices = await ProviderService.find({ providerId: provider._id });
        
        if (providerServices.length > 0) {
          const realService = providerServices[0];
          console.log(`   ✅ Assigning real service: ${realService.title}`);
          
          await Booking.findByIdAndUpdate(booking._id, {
            service: realService._id
          });
          
          console.log('   ✅ Updated booking with real service');
        } else {
          console.log('   ❌ Provider has no services available');
        }
      }
    }

    // Now test the display
    console.log('\n🧪 Testing display after fixes...');
    
    const stanley = await User.findOne({ email: '2208048@students.kcau.ac.ke' });
    if (stanley) {
      const stanleyBookings = await Booking.getRecentBookings(stanley._id, 'client', 3);
      
      console.log(`\n📊 Stanley's bookings after fix (${stanleyBookings.length}):`);
      stanleyBookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.bookingNumber}:`);
        console.log(`   Client: ${booking.client?.name} ✅`);
        console.log(`   Provider: ${booking.provider?.name || 'NULL'} ${booking.provider?.name ? '✅' : '❌'}`);
        console.log(`   Service: ${booking.service?.title || 'NULL'} ${booking.service?.title ? '✅' : '❌'}`);
        console.log(`   Status: ${booking.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBrokenReferences();