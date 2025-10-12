require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function analyzeBookingStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bookings and analyze their structure
    const allBookings = await Booking.find({});
    
    console.log('\n📊 Full booking analysis:');
    for (const booking of allBookings) {
      console.log(`\n📋 Booking ${booking.bookingNumber}:`);
      console.log(`  Provider: ${booking.provider}`);
      console.log(`  Service: ${booking.service}`);
      console.log(`  ServiceType: ${booking.serviceType}`);
      console.log(`  Status: ${booking.status}`);
      
      // Check if the service exists in ProviderService collection
      if (booking.serviceType === 'ProviderService') {
        const providerService = await ProviderService.findById(booking.service);
        if (providerService) {
          console.log(`  ✅ ProviderService found: ${providerService.title} (owner: ${providerService.providerId})`);
        } else {
          console.log(`  ❌ ProviderService NOT found for ID: ${booking.service}`);
        }
      }
      
      // Check if the service exists in Service collection
      const regularService = await Service.findById(booking.service);
      if (regularService) {
        console.log(`  ✅ Regular Service found: ${regularService.title || regularService.name}`);
      } else {
        console.log(`  ❌ Regular Service NOT found for ID: ${booking.service}`);
      }
    }

    // Check what's in both service collections
    console.log('\n📋 ProviderService collection:');
    const providerServices = await ProviderService.find({});
    providerServices.forEach(ps => {
      console.log(`  - ${ps.title} (${ps._id}) - Provider: ${ps.providerId}`);
    });

    console.log('\n📋 Service collection:');
    const services = await Service.find({});
    services.forEach(s => {
      console.log(`  - ${s.title || s.name} (${s._id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeBookingStructure();