require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function createMultipleLiveBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get different clients and Orangi's service
    const clients = await User.find({ userType: 'client' }).limit(3);
    const orangi = await User.findOne({ name: 'Orangi' });
    const service = await ProviderService.findOne({ providerId: orangi._id });

    console.log('\n🏗️  Creating multiple realistic bookings for Orangi...');

    const bookingPromises = clients.map((client, index) => {
      const bookingData = {
        bookingNumber: `BK${Date.now() + index}${Math.floor(Math.random() * 1000)}`,
        client: client._id,
        provider: orangi._id,
        service: service._id,
        serviceType: 'ProviderService',
        scheduledDate: new Date(`2025-10-${16 + index}T09:00:00.000Z`), // Different dates
        scheduledTime: {
          start: `${9 + index}:00`,
          end: `${10 + index}:00`
        },
        location: {
          address: `${123 + index * 10} Garden Avenue, Nairobi`,
          city: 'Nairobi',
          coordinates: {
            lat: -1.2864 + (index * 0.01),
            lng: 36.8172 + (index * 0.01)
          },
          instructions: [
            'Large front yard needs mowing',
            'Back garden and front lawn',
            'Small apartment compound lawn'
          ][index]
        },
        pricing: {
          basePrice: service.price,
          totalAmount: service.price,
          currency: 'KES'
        },
        payment: {
          method: ['mpesa', 'cash', 'card'][index],
          status: 'pending'
        },
        status: ['pending', 'confirmed', 'pending'][index],
        contact: {
          phone: client.phone || `+25470000000${index}`,
          email: client.email
        },
        notes: `Live booking from ${client.name} - realistic client request`,
        cancellationPolicy: 'standard'
      };

      return new Booking(bookingData).save();
    });

    const createdBookings = await Promise.all(bookingPromises);

    console.log('\n✅ Created bookings:');
    createdBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.bookingNumber} - ${booking.status}`);
      console.log(`   Client: ${clients[index].name}`);
      console.log(`   Date: ${booking.scheduledDate.toDateString()}`);
      console.log(`   Time: ${booking.scheduledTime.start} - ${booking.scheduledTime.end}`);
      console.log(`   Payment: ${booking.payment.method}`);
    });

    console.log('\n🎯 Orangi now has realistic live bookings from different clients!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createMultipleLiveBookings();