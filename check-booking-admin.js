// Use built-in fetch in Node.js 18+

async function checkSpecificBooking() {
  console.log('Checking specific booking: 67759ece31e3f0e79a16c89e\n');
  
  try {
    // Try to get the specific booking
    const response = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/bookings/67759ece31e3f0e79a16c89e');
    const data = await response.json();
    
    console.log('Booking response:', data);
    
    if (data.success && data.data) {
      const booking = data.data.booking || data.data;
      console.log('\n=== Booking Details ===');
      console.log('- ID:', booking._id);
      console.log('- Number:', booking.bookingNumber);
      console.log('- Client ID:', booking.client);
      console.log('- Provider ID:', booking.provider);
      console.log('- Service ID:', booking.service);
      console.log('- Status:', booking.status);
      console.log('- Date:', booking.scheduledDate);
      console.log('- Time:', booking.scheduledTime);
    }
    
  } catch (error) {
    console.error('Error fetching specific booking:', error.message);
  }
}

async function testAdminLogin() {
  console.log('\n=== Testing Admin Login ===');
  
  try {
    const loginResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@solutilconnect.com',
        password: 'SecureAdminPassword2024!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Admin login:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    if (loginData.success) {
      const token = loginData.data.token;
      
      // Try to get all bookings as admin
      const bookingsResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const bookingsData = await bookingsResponse.json();
      console.log('\nAll Bookings (Admin view):');
      console.log('Success:', bookingsData.success);
      console.log('Count:', bookingsData.data?.bookings?.length || 0);
      
      if (bookingsData.data?.bookings?.length > 0) {
        bookingsData.data.bookings.forEach((booking, index) => {
          console.log(`\nBooking ${index + 1}:`);
          console.log('- ID:', booking._id);
          console.log('- Number:', booking.bookingNumber);
          console.log('- Client:', booking.client?._id || booking.client);
          console.log('- Provider:', booking.provider?._id || booking.provider);
          console.log('- Service:', booking.service?.title || booking.service);
          console.log('- Status:', booking.status);
        });
      }
    } else {
      console.log('Admin login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('Error with admin login:', error.message);
  }
}

async function runCheck() {
  await checkSpecificBooking();
  await testAdminLogin();
}

runCheck();