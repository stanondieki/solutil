const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndFixProviders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Booking = require('./models/Booking');
    const ProviderService = require('./models/ProviderService');
    const User = require('./models/User');
    
    // Check recent bookings
    console.log('\n=== RECENT BOOKINGS ===');
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('provider', 'name providerStatus')
      .populate('client', 'name')
      .populate('service', 'title category');
    
    bookings.forEach(b => {
      console.log(`\nBooking: ${b.bookingNumber || b._id}`);
      console.log(`  Category: "${b.serviceCategory}"`);
      console.log(`  Metadata Category: "${b.metadata?.categoryRequested}"`);
      console.log(`  Service Category: "${b.service?.category}"`);
      console.log(`  Provider: ${b.provider ? b.provider.name + ' (' + b.provider.providerStatus + ')' : 'NONE'}`);
      console.log(`  Status: ${b.status}`);
    });
    
    // Fix bookings with undefined serviceCategory
    console.log('\n\n=== FIXING BOOKINGS WITH UNDEFINED CATEGORY ===');
    const badBookings = await Booking.find({
      $or: [
        { serviceCategory: 'undefined' },
        { serviceCategory: { $exists: false } },
        { serviceCategory: null }
      ]
    }).populate('service', 'category');
    
    console.log(`Found ${badBookings.length} bookings with missing/undefined category`);
    
    for (const booking of badBookings) {
      let newCategory = 'General Service';
      
      // Try to get from service
      if (booking.service?.category) {
        newCategory = booking.service.category;
      }
      // Try to get from metadata
      else if (booking.metadata?.categoryRequested) {
        newCategory = booking.metadata.categoryRequested;
      }
      
      console.log(`  Fixing ${booking.bookingNumber}: "${booking.serviceCategory}" -> "${newCategory}"`);
      
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { serviceCategory: newCategory } }
      );
    }
    
    console.log(`\n✅ Fixed ${badBookings.length} bookings`);
    
    // Check electrical services specifically
    console.log('\n\n=== ELECTRICAL SERVICES ===');
    const electricalServices = await ProviderService.find({ 
      category: { $regex: /electrical/i },
      isActive: true 
    }).populate('providerId', 'name providerStatus email');
    
    console.log(`Found ${electricalServices.length} electrical services`);
    electricalServices.forEach(s => {
      console.log(`  - ${s.title}`);
      console.log(`    Provider: ${s.providerId ? s.providerId.name : 'NULL'}`);
      console.log(`    Status: ${s.providerId ? s.providerId.providerStatus : 'N/A'}`);
    });
    
    // Check approved electrical providers
    console.log('\n\n=== APPROVED ELECTRICAL PROVIDERS ===');
    const approvedElectricalServices = electricalServices.filter(
      s => s.providerId && s.providerId.providerStatus === 'approved'
    );
    console.log(`Found ${approvedElectricalServices.length} approved electrical providers`);
    approvedElectricalServices.forEach(s => {
      console.log(`  ✅ ${s.providerId.name} - ${s.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndFixProviders();
