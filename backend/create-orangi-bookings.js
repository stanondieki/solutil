require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function checkOrangiBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Orangi's details
    const orangiId = '68dd91fea50506fb133d5592';
    const orangi = await User.findById(orangiId);
    
    console.log('🔍 Orangi provider:', {
      id: orangi._id,
      name: orangi.name,
      email: orangi.email,
      userType: orangi.userType
    });

    // Check Orangi's services
    const orangiServices = await ProviderService.find({ providerId: orangiId });
    console.log('\n📋 Orangi\'s services:');
    orangiServices.forEach(service => {
      console.log(`  - ${service.title} (${service._id})`);
    });

    // Check if Orangi has any bookings
    const orangiBookings = await Booking.find({
      $or: [
        { provider: orangiId },
        { service: { $in: orangiServices.map(s => s._id) } }
      ]
    });

    console.log('\n📊 Orangi\'s current bookings:', orangiBookings.length);

    if (orangiBookings.length === 0) {
      console.log('\n🎯 Orangi has no bookings. Creating test bookings...');
      
      // Find a client to book services
      const client = await User.findOne({ userType: 'client' });
      if (!client) {
        console.log('❌ No client found. Creating a test client...');
        const testClient = new User({
          name: 'Test Client',
          email: 'testclient@example.com',
          phone: '+1234567890',
          userType: 'client',
          isEmailVerified: true
        });
        await testClient.save();
        console.log('✅ Test client created:', testClient._id);
        
        // Create bookings for Orangi
        await createBookingsForOrangi(orangiId, orangiServices[0]._id, testClient._id);
      } else {
        await createBookingsForOrangi(orangiId, orangiServices[0]._id, client._id);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function createBookingsForOrangi(providerId, serviceId, clientId) {
  try {
    console.log('\n🔨 Creating test bookings for Orangi...');
    
    const bookings = [
      {
        bookingNumber: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
        client: clientId,
        provider: providerId,
        service: serviceId,
        serviceType: 'ProviderService',
        scheduledDate: new Date('2025-10-15'),
        scheduledTime: {
          start: '10:00',
          end: '12:00'
        },
        status: 'pending',
        location: {
          address: '123 Test Street',
          city: 'Test City',
          coordinates: {
            lat: -1.286389,
            lng: 36.817223
          }
        },
        pricing: {
          basePrice: 50,
          totalAmount: 50,
          currency: 'KES'
        },
        payment: {
          method: 'mpesa',
          status: 'pending'
        },
        description: 'Test lawn mowing service booking'
      },
      {
        bookingNumber: `BK${Date.now() + 1}${Math.floor(Math.random() * 1000)}`,
        client: clientId,
        provider: providerId,
        service: serviceId,
        serviceType: 'ProviderService',
        scheduledDate: new Date('2025-10-18'),
        scheduledTime: {
          start: '14:00',
          end: '16:00'
        },
        status: 'confirmed',
        location: {
          address: '456 Garden Ave',
          city: 'Test City',
          coordinates: {
            lat: -1.286389,
            lng: 36.817223
          }
        },
        pricing: {
          basePrice: 75,
          totalAmount: 75,
          currency: 'KES'
        },
        payment: {
          method: 'mpesa',
          status: 'completed'
        },
        description: 'Weekly lawn maintenance booking'
      },
      {
        bookingNumber: `BK${Date.now() + 2}${Math.floor(Math.random() * 1000)}`,
        client: clientId,
        provider: providerId,
        service: serviceId,
        serviceType: 'ProviderService',
        scheduledDate: new Date('2025-10-12'),
        scheduledTime: {
          start: '09:00',
          end: '11:00'
        },
        status: 'completed',
        location: {
          address: '789 Lawn Blvd',
          city: 'Test City',
          coordinates: {
            lat: -1.286389,
            lng: 36.817223
          }
        },
        pricing: {
          basePrice: 60,
          totalAmount: 60,
          currency: 'KES'
        },
        payment: {
          method: 'cash',
          status: 'completed'
        },
        description: 'Garden cleanup and mowing'
      }
    ];

    for (const bookingData of bookings) {
      const booking = new Booking(bookingData);
      await booking.save();
      console.log(`✅ Created booking: ${booking.bookingNumber} (${booking.status})`);
    }

    console.log('\n🎉 Successfully created 3 test bookings for Orangi!');
    
  } catch (error) {
    console.error('❌ Error creating bookings:', error);
  }
}

checkOrangiBookings();