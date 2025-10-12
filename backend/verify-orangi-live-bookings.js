require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function verifyOrangiLiveBookings() {
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

    // Get Orangi's services (for the security filter)
    const providerServices = await ProviderService.find({ providerId: orangi._id });
    const serviceIds = providerServices.map(s => s._id);
    
    console.log(`\n📋 Orangi owns ${serviceIds.length} services`);

    // Use the EXACT same query from the provider booking route
    let query = {
      $and: [
        {
          $or: [
            { provider: orangi._id }, // Direct provider assignment
            { service: { $in: serviceIds } } // Booking uses one of provider's services
          ]
        }
      ]
    };

    const bookings = await Booking.find(query)
      .populate('client', 'name email phone')
      .populate('service', 'title category price')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Orangi's live bookings: ${bookings.length}`);
    
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. 📅 ${booking.bookingNumber}`);
      console.log(`   Client: ${booking.client.name} (${booking.client.email})`);
      console.log(`   Service: ${booking.service.title} - KES ${booking.pricing.totalAmount}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Date: ${booking.scheduledDate.toDateString()}`);
      console.log(`   Time: ${booking.scheduledTime.start} - ${booking.scheduledTime.end}`);
      console.log(`   Payment: ${booking.payment.method} (${booking.payment.status})`);
      console.log(`   Location: ${booking.location.address}`);
      console.log(`   Notes: ${booking.notes}`);
    });

    console.log('\n🎉 SUCCESS! Orangi now has realistic live bookings!');
    console.log('💡 When Orangi logs into their provider dashboard, they should see these bookings');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyOrangiLiveBookings();