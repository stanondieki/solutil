// Simple test to check your live database
const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const ProviderService = require('./models/ProviderService');
const Booking = require('./models/Booking');
const User = require('./models/User');

const testDatabase = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Count services by category
    const categories = ['electrical', 'plumbing', 'cleaning', 'carpentry', 'painting', 'gardening'];
    
    console.log('\n📊 Services Available for Booking:');
    console.log('=' .repeat(50));
    
    for (const category of categories) {
      const count = await ProviderService.countDocuments({ category });
      console.log(`${category.padEnd(15)}: ${count} services`);
    }

    // Get sample services for testing
    const sampleServices = await ProviderService.find()
      .populate('providerId', 'name email')
      .limit(3);

    console.log('\n🔧 Sample Services for Testing:');
    console.log('=' .repeat(50));
    
    sampleServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.category})`);
      console.log(`   Provider: ${service.providerId?.name}`);
      console.log(`   Price: KES ${service.price} (${service.priceType})`);
      console.log(`   Test URL: http://localhost:3000/booking/form/${service._id}`);
      console.log('');
    });

    // Check recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('serviceId', 'title category')
      .populate('clientId', 'name email');

    console.log(`\n📋 Recent Bookings (${recentBookings.length}):`);
    console.log('=' .repeat(50));
    
    if (recentBookings.length === 0) {
      console.log('No bookings yet - test the system by creating some!');
    } else {
      recentBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.serviceId?.title || 'Unknown Service'}`);
        console.log(`   Client: ${booking.clientId?.name || 'Unknown Client'}`);
        console.log(`   Date: ${booking.scheduledDate} at ${booking.scheduledTime}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${new Date(booking.createdAt).toLocaleDateString()}`);
        console.log('');
      });
    }

    console.log('\n🚀 Your Booking System is Ready!');
    console.log('Test URLs:');
    console.log('- Service Discovery: http://localhost:3000/booking/electrical');
    console.log('- Service Discovery: http://localhost:3000/booking/plumbing');
    console.log('- All Services: http://localhost:3000/services');

  } catch (error) {
    console.error('❌ Database test error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

testDatabase();