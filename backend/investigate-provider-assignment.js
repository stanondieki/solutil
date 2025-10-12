require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function investigateBookingProviderIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 INVESTIGATING BOOKING PROVIDER ASSIGNMENT ISSUE\n');

    // 1. Check recent bookings
    console.log('1️⃣ RECENT BOOKINGS ANALYSIS:');
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title category providerId');

    recentBookings.forEach((booking, index) => {
      console.log(`\n   Booking ${index + 1}: ${booking.bookingNumber}`);
      console.log(`   Client: ${booking.client?.name || 'Unknown'}`);
      console.log(`   Provider: ${booking.provider?.name || 'Unknown'} (ID: ${booking.provider})`);
      console.log(`   Service: ${booking.service?.title || 'Unknown'}`);
      console.log(`   Service Provider ID: ${booking.service?.providerId || 'Not set'}`);
      console.log(`   Created: ${booking.createdAt}`);
      
      // Check if there's a mismatch
      if (booking.service?.providerId && booking.provider?._id) {
        const serviceProviderId = booking.service.providerId.toString();
        const bookingProviderId = booking.provider._id.toString();
        if (serviceProviderId !== bookingProviderId) {
          console.log(`   ⚠️  MISMATCH DETECTED!`);
          console.log(`      Booking provider: ${bookingProviderId}`);
          console.log(`      Service provider: ${serviceProviderId}`);
        }
      }
    });

    // 2. Check who Ondieki Stanley is and why he's being assigned
    console.log('\n2️⃣ ONDIEKI STANLEY ANALYSIS:');
    const ondieki = await User.findOne({ name: /ondieki stanley/i });
    if (ondieki) {
      console.log(`   Found Ondieki Stanley: ${ondieki._id}`);
      console.log(`   Email: ${ondieki.email}`);
      console.log(`   User Type: ${ondieki.userType}`);
      console.log(`   Provider Status: ${ondieki.providerStatus}`);
      
      // Check his services
      const ondiekiServices = await ProviderService.find({ providerId: ondieki._id });
      console.log(`   Services: ${ondiekiServices.length}`);
      ondiekiServices.forEach(service => {
        console.log(`      - ${service.title} (${service.category})`);
      });
    }

    // 3. Check Kemmy's information
    console.log('\n3️⃣ KEMMY ANALYSIS:');
    const kemmy = await User.findOne({ name: /kemmy/i });
    if (kemmy) {
      console.log(`   Found Kemmy: ${kemmy._id}`);
      console.log(`   Email: ${kemmy.email}`);
      console.log(`   User Type: ${kemmy.userType}`);
      console.log(`   Provider Status: ${kemmy.providerStatus}`);
      
      // Check Kemmy's services
      const kemmyServices = await ProviderService.find({ providerId: kemmy._id });
      console.log(`   Services: ${kemmyServices.length}`);
      kemmyServices.forEach(service => {
        console.log(`      - ${service.title} (${service.category})`);
      });
      
      // Check if any bookings are assigned to Kemmy
      const kemmyBookings = await Booking.find({ provider: kemmy._id });
      console.log(`   Bookings assigned to Kemmy: ${kemmyBookings.length}`);
    }

    // 4. Check the current booking assignment logic
    console.log('\n4️⃣ BOOKING ASSIGNMENT LOGIC CHECK:');
    
    // Test what happens when we search for electrical providers
    console.log('   Testing electrical provider search:');
    const electricalServices = await ProviderService.find({ 
      category: /electrical/i,
      isActive: true 
    }).populate('providerId', 'name email');
    
    console.log(`   Found ${electricalServices.length} electrical services:`);
    electricalServices.forEach(service => {
      console.log(`      - ${service.title} by ${service.providerId?.name} (${service.providerId?._id})`);
    });

    // 5. Check the specific provider selection in createSimpleBooking
    console.log('\n5️⃣ PROVIDER SELECTION ALGORITHM ANALYSIS:');
    
    if (electricalServices.length > 0) {
      const selectedService = electricalServices[0]; // This is what the current logic picks
      console.log(`   Current logic would select: ${selectedService.providerId?.name}`);
      console.log(`   Service: ${selectedService.title}`);
      console.log(`   Provider ID: ${selectedService.providerId?._id}`);
    }

    // 6. Recommendations
    console.log('\n6️⃣ ISSUE ANALYSIS:');
    if (recentBookings.some(b => b.provider?.name?.includes('Ondieki Stanley'))) {
      console.log('   ❌ Issue: Bookings are being assigned to Ondieki Stanley');
      console.log('   🔍 Root cause: The auto-assignment logic is picking the first available service');
      console.log('   💡 Solution: The enhanced booking system should fix this with better provider selection');
    }

    if (kemmy && kemmy.userType === 'provider' && kemmy.providerStatus === 'approved') {
      console.log('   ✅ Kemmy is a valid provider');
      console.log('   🎯 Users should be able to select Kemmy specifically');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

investigateBookingProviderIssue();