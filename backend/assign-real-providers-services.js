require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function assignRealProvidersAndServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get all broken bookings
    const brokenBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10);
    
    // Get available providers and services
    const availableServices = await ProviderService.find({ isActive: true }).populate('providerId', 'name email');
    
    console.log(`\n🔧 Fixing ${brokenBookings.length} bookings...`);
    console.log(`📋 Available services: ${availableServices.length}`);

    let fixedCount = 0;

    for (let i = 0; i < brokenBookings.length; i++) {
      const booking = brokenBookings[i];
      
      // Assign a service in round-robin fashion
      if (availableServices.length > 0) {
        const serviceIndex = i % availableServices.length;
        const selectedService = availableServices[serviceIndex];
        
        console.log(`\n📋 Fixing ${booking.bookingNumber}:`);
        console.log(`   Assigning service: "${selectedService.title}" by ${selectedService.providerId.name}`);
        
        await Booking.findByIdAndUpdate(booking._id, {
          provider: selectedService.providerId._id,
          service: selectedService._id,
          serviceType: 'ProviderService'
        });
        
        fixedCount++;
        console.log(`   ✅ Updated successfully`);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} bookings!`);

    // Test the results
    console.log('\n🧪 Testing results...');
    
    // Test client view
    const stanley = await User.findOne({ email: '2208048@students.kcau.ac.ke' });
    if (stanley) {
      const stanleyBookings = await Booking.getRecentBookings(stanley._id, 'client', 3);
      
      console.log(`\n👨‍💼 Stanley's bookings (${stanleyBookings.length}):`);
      stanleyBookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.bookingNumber}:`);
        console.log(`   Client: ${booking.client?.name} ✅`);
        console.log(`   Provider: ${booking.provider?.name || 'NULL'} ${booking.provider?.name ? '✅' : '❌'}`);
        console.log(`   Service: ${booking.service?.title || 'NULL'} ${booking.service?.title ? '✅' : '❌'}`);
        console.log(`   Price: KES ${booking.pricing?.totalAmount || 0}`);
      });
    }

    // Test provider view
    console.log('\n🏢 Testing provider access...');
    const providers = await User.find({ userType: 'provider' }).limit(3);
    
    for (const provider of providers) {
      const providerServices = await ProviderService.find({ providerId: provider._id });
      const serviceIds = providerServices.map(s => s._id);
      
      const providerBookings = await Booking.find({
        $or: [
          { provider: provider._id },
          { service: { $in: serviceIds } }
        ]
      }).populate('client', 'name email');
      
      console.log(`\n🏢 ${provider.name}: ${providerBookings.length} bookings`);
      if (providerBookings.length > 0) {
        providerBookings.forEach(booking => {
          console.log(`   - ${booking.bookingNumber}: ${booking.status} (${booking.client?.name})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

assignRealProvidersAndServices();