require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testEnhancedBookingSystem() {
  try {
    console.log('🚀 TESTING ENHANCED BOOKING SYSTEM\n');

    // Get a test client
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    const client = await User.findOne({ userType: 'client', email: 'test.client@solutil.com' });
    console.log('✅ Found test client:', client.name);
    await mongoose.disconnect();

    // 1. Test Enhanced Provider Matching
    console.log('\n1️⃣ TESTING ENHANCED PROVIDER MATCHING:');

    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test.client@solutil.com',
      password: 'testpass123'
    });
    const authToken = loginResponse.data.token;
    console.log('✅ Authentication successful');

    const matchingRequest = {
      category: 'cleaning',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      location: {
        area: 'Kileleshwa',
        address: 'Test Address, Kileleshwa'
      },
      providersNeeded: 1,
      urgency: 'normal'
    };

    console.log('🔍 Searching for providers with:', matchingRequest);

    const matchingResponse = await axios.post(
      'http://localhost:5000/api/booking/match-providers-v2',
      matchingRequest,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Enhanced matching response status:', matchingResponse.status);
    console.log('📊 Matching results:');
    console.log(`   Found: ${matchingResponse.data.data.providers.length} providers`);
    console.log(`   Service matches: ${matchingResponse.data.data.matchingSummary.serviceMatches}`);
    console.log(`   Skill matches: ${matchingResponse.data.data.matchingSummary.skillMatches}`);

    matchingResponse.data.data.providers.slice(0, 3).forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.name} (${provider.matchType}) - Score: ${provider.matchScore}`);
      console.log(`      Service: ${provider.serviceName || 'Generic service'}`);
      console.log(`      Rating: ${provider.profile.rating}/5.0 (${provider.profile.reviewCount} reviews)`);
      console.log(`      Price: KES ${provider.profile.hourlyRate}`);
    });

    // 2. Test Enhanced Booking Creation
    console.log('\n2️⃣ TESTING ENHANCED BOOKING CREATION:');

    const topProvider = matchingResponse.data.data.providers[0];
    
    const bookingRequest = {
      category: {
        id: 'cleaning',
        name: 'Cleaning'
      },
      date: matchingRequest.date,
      time: matchingRequest.time,
      location: matchingRequest.location,
      description: 'Enhanced booking system test - thorough house cleaning needed',
      urgency: 'normal',
      providersNeeded: 1,
      paymentTiming: 'pay-after',
      paymentMethod: 'cash',
      selectedProvider: {
        id: topProvider._id,
        name: topProvider.name,
        serviceId: topProvider.serviceId
      },
      totalAmount: 3500
    };

    console.log('📝 Creating enhanced booking with:', {
      provider: bookingRequest.selectedProvider.name,
      category: bookingRequest.category.id,
      location: bookingRequest.location.area,
      amount: bookingRequest.totalAmount
    });

    const bookingResponse = await axios.post(
      'http://localhost:5000/api/bookings/simple-v2',
      bookingRequest,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Enhanced booking created successfully!');
    console.log('📋 Booking details:');
    
    const booking = bookingResponse.data.data.booking;
    console.log(`   ID: ${booking._id}`);
    console.log(`   Number: ${booking.bookingNumber}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Client: ${booking.client.name}`);
    console.log(`   Provider: ${booking.provider.name}`);
    console.log(`   Service: ${booking.service.title}`);
    console.log(`   Date: ${booking.scheduledDate}`);
    console.log(`   Time: ${booking.scheduledTime.start} - ${booking.scheduledTime.end}`);
    console.log(`   Location: ${booking.location.address}`);
    console.log(`   Total: KES ${booking.pricing.totalAmount}`);
    console.log(`   Assignment Method: ${booking.metadata.providerAssignmentMethod}`);

    // 3. Test Auto-Assignment (no specific provider selected)
    console.log('\n3️⃣ TESTING AUTO-ASSIGNMENT BOOKING:');

    const autoBookingRequest = {
      category: {
        id: 'electrical',
        name: 'Electrical'
      },
      date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
      time: '14:00',
      location: {
        area: 'Westlands',
        address: 'Test Office, Westlands'
      },
      description: 'Auto-assignment test - electrical outlet installation',
      urgency: 'normal',
      providersNeeded: 1,
      paymentTiming: 'pay-after',
      paymentMethod: 'mpesa',
      totalAmount: 4000
    };

    console.log('🤖 Creating auto-assignment booking for electrical service...');

    const autoBookingResponse = await axios.post(
      'http://localhost:5000/api/bookings/simple-v2',
      autoBookingRequest,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Auto-assignment booking created successfully!');
    
    const autoBooking = autoBookingResponse.data.data.booking;
    console.log(`   Auto-assigned provider: ${autoBooking.provider.name}`);
    console.log(`   Service: ${autoBooking.service.title}`);
    console.log(`   Assignment method: ${autoBooking.metadata.providerAssignmentMethod}`);

    console.log('\n🎉 ENHANCED BOOKING SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('\n✅ Key Improvements Verified:');
    console.log('   ✅ Smart provider matching with scoring');
    console.log('   ✅ Reliable provider assignment');
    console.log('   ✅ Enhanced booking creation with metadata');
    console.log('   ✅ Both user-selection and auto-assignment working');
    console.log('   ✅ No validation errors or null assignments');

  } catch (error) {
    console.error('❌ Enhanced booking system test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEnhancedBookingSystem();