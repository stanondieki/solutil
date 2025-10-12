require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function investigateBookingIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get the recent bookings from the screenshot
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service'); // This might fail if serviceType is wrong

    console.log('\n📋 Recent Bookings Analysis:');
    for (let i = 0; i < recentBookings.length; i++) {
      const booking = recentBookings[i];
      console.log(`\n${i + 1}. Booking ${booking.bookingNumber}:`);
      console.log(`   Client: ${booking.client?.name} (${booking.client?.email})`);
      console.log(`   Provider: ${booking.provider?.name} (${booking.provider?.email})`);
      console.log(`   Service Type: ${booking.serviceType}`);
      console.log(`   Service ID: ${booking.service}`);
      console.log(`   Service Object:`, booking.service);
      
      // Try to manually fetch the service
      if (booking.serviceType === 'ProviderService') {
        const providerService = await ProviderService.findById(booking.service);
        console.log(`   Manual ProviderService fetch:`, providerService ? {
          title: providerService.title,
          provider: providerService.providerId,
          price: providerService.price
        } : 'NOT FOUND');
      }
    }

    // Check if there are any issues with provider viewing their bookings
    console.log('\n🔍 Provider Booking Access Test:');
    const providers = await User.find({ userType: 'provider' }).limit(3);
    
    for (const provider of providers) {
      const providerServices = await ProviderService.find({ providerId: provider._id });
      const serviceIds = providerServices.map(s => s._id);
      
      const bookingsForProvider = await Booking.find({
        $or: [
          { provider: provider._id },
          { service: { $in: serviceIds } }
        ]
      });
      
      console.log(`\n📊 ${provider.name}:`);
      console.log(`   Services: ${providerServices.length}`);
      console.log(`   Bookings: ${bookingsForProvider.length}`);
      
      if (bookingsForProvider.length > 0) {
        bookingsForProvider.forEach(booking => {
          console.log(`   - ${booking.bookingNumber}: ${booking.status} (${booking.serviceType})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

investigateBookingIssues();