require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');
const Booking = require('./models/Booking');

async function testProviderAssignmentDebug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== PROVIDER ASSIGNMENT DEBUG ===');
    
    // 1. Check all providers and their status
    console.log('\n1️⃣ ALL PROVIDERS STATUS:');
    const allProviders = await User.find({ userType: 'provider' })
      .select('name email providerStatus providerProfile')
      .sort({ name: 1 });
    
    allProviders.forEach(provider => {
      console.log(`   ${provider.name}: ${provider.providerStatus || 'undefined'} (${provider.email})`);
    });

    // 2. Check Kemmy specifically
    console.log('\n2️⃣ KEMMY ANALYSIS:');
    const kemmy = await User.findOne({ name: /kemmy/i });
    if (kemmy) {
      console.log(`   ID: ${kemmy._id}`);
      console.log(`   Name: ${kemmy.name}`);
      console.log(`   Email: ${kemmy.email}`);
      console.log(`   Status: ${kemmy.providerStatus}`);
      console.log(`   User Type: ${kemmy.userType}`);
      
      // Check Kemmy's services
      const kemmyServices = await ProviderService.find({ providerId: kemmy._id });
      console.log(`   Services: ${kemmyServices.length}`);
      kemmyServices.forEach(service => {
        console.log(`      - ${service.title} (${service.category}) - Active: ${service.isActive}`);
      });
    }

    // 3. Check Yvette Mukhungu specifically
    console.log('\n3️⃣ YVETTE MUKHUNGU ANALYSIS:');
    const yvette = await User.findOne({ name: /yvette.*mukhungu/i });
    if (yvette) {
      console.log(`   ID: ${yvette._id}`);
      console.log(`   Name: ${yvette.name}`);
      console.log(`   Email: ${yvette.email}`);
      console.log(`   Status: ${yvette.providerStatus}`);
      console.log(`   User Type: ${yvette.userType}`);
      
      // Check Yvette's services
      const yvetteServices = await ProviderService.find({ providerId: yvette._id });
      console.log(`   Services: ${yvetteServices.length}`);
      yvetteServices.forEach(service => {
        console.log(`      - ${service.title} (${service.category}) - Active: ${service.isActive}`);
      });
    }

    // 4. Test electrical service provider matching
    console.log('\n4️⃣ ELECTRICAL SERVICE MATCHING:');
    const electricalServices = await ProviderService.find({ 
      category: 'electrical',
      isActive: true 
    }).populate({
      path: 'providerId',
      match: { 
        userType: 'provider',
        providerStatus: 'approved'
      },
      select: 'name email userType providerStatus providerProfile'
    });
    
    const validElectricalServices = electricalServices.filter(service => service.providerId);
    console.log(`   Found ${validElectricalServices.length} electrical services with approved providers`);
    
    validElectricalServices.forEach((service, index) => {
      const provider = service.providerId;
      const profile = provider.providerProfile || {};
      console.log(`   ${index + 1}. ${provider.name} - ${service.title}`);
      console.log(`      Status: ${provider.providerStatus}`);
      console.log(`      Rating: ${profile.rating || 'N/A'}`);
      console.log(`      Total Jobs: ${profile.totalJobs || 0}`);
    });

    // 5. Check recent bookings to see assignment patterns
    console.log('\n5️⃣ RECENT BOOKING ASSIGNMENTS:');
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('provider', 'name email')
      .populate('service', 'title category');
    
    recentBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. Booking ${booking.bookingNumber}:`);
      console.log(`      Provider: ${booking.provider?.name || 'Not assigned'}`);
      console.log(`      Service: ${booking.service?.title || 'Unknown'}`);
      console.log(`      Category: ${booking.service?.category || 'Unknown'}`);
      console.log(`      Created: ${booking.createdAt.toISOString().split('T')[0]}`);
    });

    // 6. Simulate provider selection logic
    console.log('\n6️⃣ PROVIDER SELECTION SIMULATION:');
    if (validElectricalServices.length > 0) {
      console.log('   Current selection logic (best rating + experience):');
      
      const bestService = validElectricalServices.reduce((best, current) => {
        const currentProvider = current.providerId.providerProfile || {};
        const bestProvider = best.providerId.providerProfile || {};
        
        const currentScore = (currentProvider.rating || 4.0) * 10 + (currentProvider.totalJobs || 0);
        const bestScore = (bestProvider.rating || 4.0) * 10 + (bestProvider.totalJobs || 0);
        
        console.log(`      ${current.providerId.name}: Score = ${currentScore.toFixed(1)}`);
        
        return currentScore > bestScore ? current : best;
      });
      
      console.log(`   🏆 Winner: ${bestService.providerId.name} with service "${bestService.title}"`);
    }

    console.log('\n✅ PROVIDER ASSIGNMENT DEBUG COMPLETE');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testProviderAssignmentDebug();