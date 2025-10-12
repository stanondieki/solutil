require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function testProviderQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Test with provider who has bookings: kemmy
    const providerId = '68e4fcf48e248b993e547633';
    
    const provider = await User.findById(providerId);
    console.log('\n🔍 Testing provider:', {
      id: provider._id,
      name: provider.name,
      email: provider.email,
      userType: provider.userType
    });

    // Replicate the exact query from providerBookings.js
    const [services, providerServices] = await Promise.all([
      Service.find({ providerId: providerId }).select('_id'),
      ProviderService.find({ providerId: providerId }).select('_id')
    ]);
    
    // Combine service IDs from both models
    const serviceIds = [
      ...services.map(s => s._id),
      ...providerServices.map(s => s._id)
    ];
    
    console.log('\n📋 Services found:');
    console.log('Regular services:', services.length);
    console.log('Provider services:', providerServices.length);
    console.log('Combined service IDs:', serviceIds);

    // Test the exact query being used
    let query = {
      $and: [
        {
          $or: [
            { provider: providerId }, // Direct provider assignment
            { service: { $in: serviceIds } } // Booking uses one of provider's services
          ]
        }
      ]
    };

    console.log('\n🔍 Testing query:', JSON.stringify(query, null, 2));

    const bookings = await Booking.find(query);
    console.log('\n📊 Query results:', bookings.length, 'bookings');
    
    bookings.forEach(booking => {
      console.log(`  - ${booking.bookingNumber}: ${booking.status}`);
      console.log(`    Provider: ${booking.provider}`);
      console.log(`    Service: ${booking.service}`);
      console.log(`    ServiceType: ${booking.serviceType}`);
    });

    // Test individual parts of the query
    console.log('\n🧪 Testing query parts:');
    
    const directProviderBookings = await Booking.find({ provider: providerId });
    console.log(`Direct provider bookings: ${directProviderBookings.length}`);
    
    const serviceBasedBookings = await Booking.find({ service: { $in: serviceIds } });
    console.log(`Service-based bookings: ${serviceBasedBookings.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testProviderQuery();