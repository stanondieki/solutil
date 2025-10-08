// Use built-in fetch in Node.js 18+

// Stanley (client) - should see the booking in My Bookings
async function testClientBookings() {
  console.log('\n=== Testing Client Bookings (Stanley) ===');
  
  try {
    const loginResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'stanley@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Stanley login:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    if (!loginData.success) {
      console.log('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    
    // Get client bookings
    const bookingsResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/bookings/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const bookingsData = await bookingsResponse.json();
    console.log('\nStanley Bookings Response:');
    console.log('Success:', bookingsData.success);
    console.log('Total bookings:', bookingsData.data?.bookings?.length || 0);
    
    if (bookingsData.data?.bookings?.length > 0) {
      bookingsData.data.bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log('- ID:', booking._id);
        console.log('- Number:', booking.bookingNumber);
        console.log('- Service:', booking.service?.title || 'N/A');
        console.log('- Provider:', booking.provider?.businessName || booking.provider?.user?.name || 'N/A');
        console.log('- Status:', booking.status);
        console.log('- Date:', booking.scheduledDate);
        console.log('- Time:', `${booking.scheduledTime?.start} - ${booking.scheduledTime?.end}`);
      });
    } else {
      console.log('No bookings found for Stanley');
    }

  } catch (error) {
    console.error('Error testing client bookings:', error.message);
  }
}

// Kemmy (provider) - should see the booking in Provider Bookings
async function testProviderBookings() {
  console.log('\n\n=== Testing Provider Bookings (Kemmy) ===');
  
  try {
    const loginResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'kemmy@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Kemmy login:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    if (!loginData.success) {
      console.log('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    
    // Get provider bookings  
    const bookingsResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/provider-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const bookingsData = await bookingsResponse.json();
    console.log('\nKemmy Provider Bookings Response:');
    console.log('Success:', bookingsData.success);
    console.log('Total bookings:', bookingsData.data?.bookings?.length || 0);
    
    if (bookingsData.data?.bookings?.length > 0) {
      bookingsData.data.bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log('- ID:', booking._id);
        console.log('- Number:', booking.bookingNumber);
        console.log('- Service:', booking.service?.title || 'N/A');
        console.log('- Client:', booking.client?.name || 'N/A');
        console.log('- Status:', booking.status);
        console.log('- Date:', booking.scheduledDate);
        console.log('- Time:', `${booking.scheduledTime?.start} - ${booking.scheduledTime?.end}`);
      });
    } else {
      console.log('No bookings found for Kemmy');
    }

    // Also get booking stats
    const statsResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/provider-bookings?includeStats=true', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const statsData = await statsResponse.json();
    if (statsData.success && statsData.data?.stats) {
      console.log('\nProvider Stats:');
      console.log('- Total:', statsData.data.stats.total);
      console.log('- Pending:', statsData.data.stats.pending);
      console.log('- Confirmed:', statsData.data.stats.confirmed);
      console.log('- Completed:', statsData.data.stats.completed);
    }

  } catch (error) {
    console.error('Error testing provider bookings:', error.message);
  }
}

async function runTests() {
  console.log('Testing Post-Booking Dashboard Visibility');
  console.log('==========================================');
  
  await testClientBookings();
  await testProviderBookings();
  
  console.log('\n\n=== Test Complete ===');
}

runTests();