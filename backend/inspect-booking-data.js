require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function inspectBookingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Get a specific booking and inspect its raw data
    const booking = await Booking.findOne({ bookingNumber: 'BK1760196580555194' }).lean();
    
    console.log('\n🔍 Raw booking data:');
    console.log(JSON.stringify(booking, null, 2));

    // Check if the service exists
    console.log(`\n🔍 Checking service: ${booking.service}`);
    const service = await ProviderService.findById(booking.service);
    
    if (service) {
      console.log('✅ Service found:', {
        title: service.title,
        providerId: service.providerId,
        category: service.category
      });
      
      // Now update this specific booking
      const updateResult = await Booking.findByIdAndUpdate(booking._id, {
        provider: service.providerId
      }, { new: true });
      
      console.log('✅ Updated booking provider to:', updateResult.provider);
    } else {
      console.log('❌ Service not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

inspectBookingData();