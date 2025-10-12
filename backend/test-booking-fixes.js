require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function testBookingFixes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing booking fixes...');

    // 1. Test getUserBookings with proper population
    console.log('\n1️⃣ Testing client booking display (getUserBookings):');
    
    const clientUser = await User.findOne({ userType: 'client' });
    if (clientUser) {
      console.log(`   Testing with client: ${clientUser.name} (${clientUser.email})`);
      
      const clientBookings = await Booking.getRecentBookings(clientUser._id, 'client', 5);
      console.log(`   Found ${clientBookings.length} bookings for client`);
      
      clientBookings.forEach((booking, index) => {
        console.log(`\n   📋 Booking ${index + 1}: ${booking.bookingNumber}`);
        console.log(`      Client: ${booking.client?.name} ✅`);
        console.log(`      Provider: ${booking.provider?.name || 'NOT POPULATED'} ${booking.provider?.name ? '✅' : '❌'}`);
        console.log(`      Service: ${booking.service?.title || booking.service?.name || 'NOT POPULATED'} ${booking.service ? '✅' : '❌'}`);
        console.log(`      Service Type: ${booking.serviceType}`);
        console.log(`      Status: ${booking.status}`);
      });
    }

    // 2. Test provider booking access
    console.log('\n2️⃣ Testing provider booking access:');
    
    const providers = await User.find({ userType: 'provider' }).limit(3);
    
    for (const provider of providers) {
      console.log(`\n   🏢 Testing provider: ${provider.name} (${provider.email})`);
      
      // Get provider's services
      const providerServices = await ProviderService.find({ providerId: provider._id });
      const serviceIds = providerServices.map(s => s._id);
      
      // Test the exact query from providerBookings route
      const providerBookings = await Booking.find({
        $or: [
          { provider: provider._id },
          { service: { $in: serviceIds } }
        ]
      }).populate('client', 'name email')
        .populate('service');
      
      console.log(`      Services: ${providerServices.length}`);
      console.log(`      Bookings: ${providerBookings.length}`);
      
      if (providerBookings.length > 0) {
        providerBookings.forEach(booking => {
          console.log(`      - ${booking.bookingNumber}: ${booking.status} (Client: ${booking.client?.name})`);
        });
      }
    }

    // 3. Test auto-assignment capability
    console.log('\n3️⃣ Testing auto-assignment capability:');
    
    const categories = ['cleaning', 'plumbing', 'electrical', 'gardening', 'other'];
    
    for (const category of categories) {
      const availableServices = await ProviderService.find({ 
        category: category,
        isActive: true 
      }).populate('providerId', 'name email');
      
      console.log(`   ${category}: ${availableServices.length} services available`);
      if (availableServices.length > 0) {
        console.log(`      Example: "${availableServices[0].title}" by ${availableServices[0].providerId?.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testBookingFixes();