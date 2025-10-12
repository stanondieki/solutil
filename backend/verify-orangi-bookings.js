require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function verifyOrangiBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Test with Orangi who should now have bookings
    const orangiId = '68dd91fea50506fb133d5592';
    
    console.log('🔍 Testing Orangi bookings after creation...');

    // Simulate the exact API endpoint logic for Orangi
    const [services, providerServices] = await Promise.all([
      Service.find({ providerId: orangiId }).select('_id'),
      ProviderService.find({ providerId: orangiId }).select('_id')
    ]);
    
    // Combine service IDs from both models
    const serviceIds = [
      ...services.map(s => s._id),
      ...providerServices.map(s => s._id)
    ];
    
    console.log(`🔒 Provider ${orangiId} accessing bookings`);
    console.log(`📋 Provider owns ${serviceIds.length} services`);
    console.log('Service IDs:', serviceIds);
    
    // Build query - same as the API
    let query = {
      $and: [
        {
          $or: [
            { provider: orangiId }, // Direct provider assignment
            { service: { $in: serviceIds } } // Booking uses one of provider's services
          ]
        }
      ]
    };

    console.log('\n🔍 Query:', JSON.stringify(query, null, 2));

    // Execute query with population like the API
    const bookings = await Booking.find(query)
      .populate('client', 'name email phone')
      .populate('service', 'title category price')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Found ${bookings.length} bookings for Orangi:`);
    
    bookings.forEach(booking => {
      console.log(`\n📋 ${booking.bookingNumber}:`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Date: ${booking.scheduledDate.toISOString().split('T')[0]}`);
      console.log(`  Time: ${booking.scheduledTime.start} - ${booking.scheduledTime.end}`);
      console.log(`  Amount: ${booking.pricing.currency} ${booking.pricing.totalAmount}`);
      console.log(`  Client: ${booking.client ? booking.client.name : 'Not populated'}`);
      console.log(`  Service: ${booking.service ? booking.service.title : 'Not populated'}`);
    });

    // Get total count
    const totalBookings = await Booking.countDocuments(query);
    console.log(`\n📈 Total bookings for Orangi: ${totalBookings}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyOrangiBookings();