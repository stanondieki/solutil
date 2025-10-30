const axios = require('axios');
require('dotenv').config();

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...\n');
    
    const loginData = {
      email: 'info@solutilconnect.com',
      password: 'admin2024!'  // This might need to be adjusted
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('🎫 Admin Token:', response.data.token);
    
    // Now test the admin bookings API
    console.log('\n🧪 Testing admin bookings API with admin token...');
    
    const bookingsResponse = await axios.get('http://localhost:5000/api/admin/bookings', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin bookings API response:');
    console.log({
      status: bookingsResponse.data.status,
      results: bookingsResponse.data.results,
      total: bookingsResponse.data.total,
      hasBookings: bookingsResponse.data.data?.bookings ? bookingsResponse.data.data.bookings.length > 0 : false
    });
    
    if (bookingsResponse.data.data?.bookings && bookingsResponse.data.data.bookings.length > 0) {
      console.log('\n📋 First booking:');
      const firstBooking = bookingsResponse.data.data.bookings[0];
      console.log({
        bookingNumber: firstBooking.bookingNumber,
        client: firstBooking.client?.name,
        provider: firstBooking.provider?.name,
        service: firstBooking.service?.title || firstBooking.service?.name,
        status: firstBooking.status,
        serviceType: firstBooking.serviceType
      });
      
      console.log(`\n🎉 SUCCESS: Admin can see ${bookingsResponse.data.results} bookings!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

loginAsAdmin();