require('dotenv').config();
const axios = require('axios');

async function testLiveBookingCreation() {
  try {
    console.log('🧪 Testing live booking creation...');
    
    // First, get a client token (simulate login)
    console.log('\n1️⃣ Getting client authentication...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'abuyallan45@gmail.com',
      password: 'password'
    });
    
    const clientToken = loginResponse.data.token;
    console.log('✅ Client authenticated');

    // Create a test booking
    console.log('\n2️⃣ Creating test booking...');
    const bookingData = {
      serviceType: 'cleaning',
      bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      bookingTime: '10:00',
      location: 'Test Address, Nairobi',
      specialRequests: 'Test booking to verify the fix works'
    };

    console.log('Booking request:', bookingData);

    const response = await axios.post(
      'http://localhost:5000/api/bookings/create-simple', 
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Booking created successfully!');
    console.log('Response:', response.data);
    
    const booking = response.data.booking;
    console.log('\n📋 Booking Details:');
    console.log(`   ID: ${booking._id}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Provider: ${booking.provider || 'Not assigned'}`);
    console.log(`   Service: ${booking.service || 'Not assigned'}`);
    console.log(`   Date: ${booking.bookingDate}`);
    console.log(`   Time: ${booking.bookingTime}`);

    console.log('\n🎉 SUCCESS: Booking creation validation error has been fixed!');

  } catch (error) {
    console.error('❌ Error testing booking creation:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLiveBookingCreation();