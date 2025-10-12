// Debug provider bookings issue
require('dotenv').config();
const mongoose = require('mongoose');

async function debugProviderBookings() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    const Service = require('./models/Service');
    const ProviderService = require('./models/ProviderService');
    const Booking = require('./models/Booking');

    // Find the provider by email (from logs)
    const providerEmail = '39839125o@gmail.com';
    const provider = await User.findOne({ email: providerEmail });
    
    if (!provider) {
      console.log('❌ Provider not found');
      return;
    }

    console.log('🔍 Provider found:', {
      id: provider._id,
      name: provider.name,
      email: provider.email,
      userType: provider.userType
    });

    // Check provider's services in both Service and ProviderService collections
    console.log('\n📋 Checking provider services...');
    
    const services = await Service.find({ providerId: provider._id });
    console.log('Services (Service collection):', services.length);
    services.forEach(service => {
      console.log(`  - ${service.title} (${service._id})`);
    });

    const providerServices = await ProviderService.find({ providerId: provider._id });
    console.log('Services (ProviderService collection):', providerServices.length);
    providerServices.forEach(service => {
      console.log(`  - ${service.title} (${service._id})`);
    });

    // Get all service IDs
    const allServiceIds = [
      ...services.map(s => s._id),
      ...providerServices.map(s => s._id)
    ];

    console.log('\n📊 All service IDs for this provider:', allServiceIds);

    // Check all bookings in the system
    console.log('\n📋 Checking all bookings...');
    const allBookings = await Booking.find({}).select('_id provider service serviceType bookingNumber status');
    console.log('Total bookings in system:', allBookings.length);

    allBookings.forEach(booking => {
      console.log(`  Booking ${booking.bookingNumber}:`, {
        provider: booking.provider,
        service: booking.service,
        serviceType: booking.serviceType,
        status: booking.status
      });
    });

    // Check bookings that should belong to this provider
    console.log('\n🔍 Checking bookings for this provider...');
    
    // Method 1: Direct provider assignment
    const directBookings = await Booking.find({ provider: provider._id });
    console.log('Direct provider bookings:', directBookings.length);

    // Method 2: Service-based bookings
    const serviceBookings = await Booking.find({ 
      service: { $in: allServiceIds }
    });
    console.log('Service-based bookings:', serviceBookings.length);

    // Method 3: Combined query (what our API uses)
    const combinedBookings = await Booking.find({
      $or: [
        { provider: provider._id },
        { service: { $in: allServiceIds } }
      ]
    });
    console.log('Combined query bookings:', combinedBookings.length);

    if (combinedBookings.length > 0) {
      console.log('\n📋 Found bookings:');
      combinedBookings.forEach(booking => {
        console.log(`  - ${booking.bookingNumber}: ${booking.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugProviderBookings();