const axios = require('axios');
require('dotenv').config();

async function testLiveAdminAPI() {
  try {
    console.log('🧪 Testing Live Admin API Endpoint...\n');
    
    // Get the backend URL from environment or use default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const apiUrl = `${backendUrl}/api/admin/bookings`;
    
    console.log(`📡 Making request to: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data Structure:');
    console.log({
      status: response.data.status,
      results: response.data.results,
      total: response.data.total,
      page: response.data.page,
      pages: response.data.pages,
      hasBookings: response.data.data?.bookings ? response.data.data.bookings.length > 0 : false
    });
    
    if (response.data.data?.bookings && response.data.data.bookings.length > 0) {
      console.log('\n📋 Sample booking from API:');
      const sample = response.data.data.bookings[0];
      console.log({
        bookingNumber: sample.bookingNumber,
        client: sample.client?.name || 'No client name',
        provider: sample.provider?.name || 'No provider name', 
        service: sample.service?.title || sample.service?.name || 'No service name',
        status: sample.status,
        serviceType: sample.serviceType,
        createdAt: sample.createdAt
      });
      
      console.log(`\n✅ SUCCESS: Admin API is returning ${response.data.results} bookings!`);
    } else {
      console.log('\n⚠️ WARNING: API returned no bookings');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request error:', error.message);
    }
  }
}

testLiveAdminAPI();