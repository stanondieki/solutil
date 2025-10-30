const axios = require('axios');
require('dotenv').config();

async function testAdminAPIWithAuth() {
  try {
    console.log('🧪 Testing Admin API with Authentication...\n');
    
    // First, let's test the backend health
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Sample JWT token from the logs (from a real user session)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZmMjhiZDc0ZWM3NWM0OWZhMDZkMTciLCJlbWFpbCI6Im9uZGlla2lzdGFubGV5MjFAZ21haWwuY29tIiwidXNlclR5cGUiOiJjbGllbnQiLCJpYXQiOjE3NjE3NjY3ODksImV4cCI6MTc2MjM3MTU4OX0.w1LqYLLWJj23yhL0JON0nP9V-l9b5Nq5cevllkt5A1E';
    
    const response = await axios.get('http://localhost:5000/api/admin/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:');
    console.log({
      status: response.data.status,
      results: response.data.results,
      total: response.data.total,
      hasBookings: response.data.data?.bookings ? response.data.data.bookings.length > 0 : false
    });
    
    if (response.data.data?.bookings && response.data.data.bookings.length > 0) {
      console.log('\n📋 First 3 bookings from API:');
      response.data.data.bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.bookingNumber}:`);
        console.log(`   Client: ${booking.client?.name || 'No client'}`);
        console.log(`   Provider: ${booking.provider?.name || 'No provider'}`);
        console.log(`   Service: ${booking.service?.title || booking.service?.name || 'No service'}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Service Type: ${booking.serviceType}`);
        console.log('');
      });
      
      console.log(`\n🎉 SUCCESS: Admin API is working! Found ${response.data.results} bookings`);
    } else {
      console.log('\n⚠️ API returned no bookings');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Error:', error.response.data.error);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request error:', error.message);
    }
  }
}

testAdminAPIWithAuth();