// Test authentication token validity
const API_BASE = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

async function testAuthToken() {
  try {
    // Check if we can read localStorage (this would run in browser console)
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      
      if (!token) {
        console.log('❌ No token found in localStorage');
        return;
      }

      console.log('🔐 Found token:', token.substring(0, 20) + '...');

      // Test the /api/auth/me endpoint
      console.log('🔄 Testing /api/auth/me endpoint...');
      const authResponse = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth me response:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        ok: authResponse.ok
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ Auth me data:', authData);
      } else {
        console.log('❌ Auth me failed');
      }

      // Test the /api/users/profile endpoint
      console.log('\n🔄 Testing /api/users/profile endpoint...');
      const profileResponse = await fetch(`${API_BASE}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        ok: profileResponse.ok
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile data:', profileData);
      } else {
        const errorData = await profileResponse.text();
        console.log('❌ Profile error:', errorData);
      }

      // Test the bookings endpoint
      console.log('\n📚 Testing /api/bookings/my-bookings endpoint...');
      const bookingsResponse = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Bookings response:', {
        status: bookingsResponse.status,
        statusText: bookingsResponse.statusText,
        ok: bookingsResponse.ok
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('✅ Bookings data:', bookingsData);
      } else {
        const errorData = await bookingsResponse.text();
        console.log('❌ Bookings error:', errorData);
      }

    } else {
      console.log('❌ localStorage not available (run this in browser console)');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testAuthToken();
}

console.log('🔧 Auth Token Test Script Loaded');
console.log('📝 To run: testAuthToken()');