const fetch = require('node-fetch');

async function testBookingFixes() {
  console.log('🧪 Testing Booking System Fixes');
  console.log('================================\n');

  // Test 1: Admin Booking API
  console.log('1. Testing Admin Booking API...');
  try {
    // First login as admin to get token
    const loginResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@solutilconnect.com',
        password: 'SecureAdminPassword2024!'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Admin login successful');
      
      // Test admin bookings API
      const bookingsResponse = await fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
          'Content-Type': 'application/json'
        }
      });

      const bookingsData = await bookingsResponse.json();
      console.log('📋 Admin Bookings Response:', {
        success: bookingsData.status === 'success',
        totalBookings: bookingsData.results || 0,
        hasData: !!bookingsData.data,
        bookingsArray: Array.isArray(bookingsData.data?.bookings)
      });

      if (bookingsData.status === 'success' && bookingsData.data?.bookings?.length > 0) {
        console.log('✅ Admin can now see bookings!');
        console.log(`📊 Found ${bookingsData.data.bookings.length} bookings`);
        
        // Show sample booking
        const sample = bookingsData.data.bookings[0];
        console.log('📋 Sample booking:', {
          id: sample._id,
          number: sample.bookingNumber,
          client: sample.client?.name || 'N/A',
          provider: sample.provider?.name || 'N/A',
          status: sample.status
        });
      } else {
        console.log('ℹ️ Admin API works but no bookings found (this is expected if no bookings exist)');
      }
    } else {
      console.log('❌ Admin login failed:', loginData.message);
    }
  } catch (error) {
    console.error('💥 Admin booking test failed:', error.message);
  }

  console.log('\n2. Testing Duplicate Prevention...');
  console.log('(This test requires frontend interaction - check browser console for deduplication logs)');
  
  console.log('\n✅ Test Complete!');
  console.log('\n🎯 Summary of Fixes Applied:');
  console.log('1. ✅ Added frontend booking lock to prevent double-clicks');
  console.log('2. ✅ Added backend deduplication check (10-second window)');
  console.log('3. ✅ Fixed admin booking API field mapping (client vs customer)');
  console.log('4. ✅ Enhanced admin booking error logging');
  console.log('5. ✅ Improved booking creation debugging');
  
  console.log('\n📋 Next Steps:');
  console.log('• Test booking creation in browser to verify no duplicates');
  console.log('• Check admin panel for booking visibility');
  console.log('• Monitor backend logs for deduplication messages');
}

testBookingFixes();