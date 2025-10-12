require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function createLiveBookingAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get client and service details
    const client = await User.findOne({ email: 'abuyallan45@gmail.com' }); // Allan Abuya
    const orangi = await User.findOne({ name: 'Orangi' });
    const service = await ProviderService.findOne({ providerId: orangi._id });

    console.log('\n📋 Booking Details:');
    console.log(`Client: ${client.name} (${client.email})`);
    console.log(`Provider: ${orangi.name} (${orangi.email})`);
    console.log(`Service: ${service.title} - $${service.price}`);

    // Create a live booking (similar to what frontend would do)
    const bookingData = {
      bookingNumber: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
      client: client._id,
      provider: orangi._id,
      service: service._id,
      serviceType: 'ProviderService',
      scheduledDate: new Date('2025-10-15T10:00:00.000Z'), // Tomorrow
      scheduledTime: {
        start: '10:00',
        end: '11:00'
      },
      location: {
        address: '123 Test Street, Nairobi',
        city: 'Nairobi',
        coordinates: {
          lat: -1.2864,
          lng: 36.8172
        },
        instructions: 'Front yard lawn mowing required'
      },
      pricing: {
        basePrice: service.price,
        totalAmount: service.price,
        currency: 'KES'
      },
      payment: {
        method: 'cash',
        status: 'pending'
      },
      status: 'pending',
      contact: {
        phone: client.phone || '+254700000000',
        email: client.email
      },
      notes: 'Live booking created through API - realistic client booking',
      duration: service.duration || 60,
      cancellationPolicy: 'standard',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('\n✅ Live booking created successfully!');
    console.log(`Booking Number: ${booking.bookingNumber}`);
    console.log(`Scheduled: ${booking.scheduledDate} at ${booking.scheduledTime}`);
    console.log(`Status: ${booking.status}`);
    console.log(`Amount: $${booking.totalAmount}`);

    console.log('\n🎯 Now Orangi should see this booking when they login!');

  } catch (error) {
    console.error('❌ Error creating booking:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Only run if called directly (not when testing)
if (require.main === module) {
  console.log('🚀 Creating live booking for Orangi...');
  console.log('📝 This simulates a real client booking through the system');
  createLiveBookingAPI();
}