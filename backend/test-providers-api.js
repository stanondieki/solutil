const https = require('https');
const http = require('http');

// Test the providers API endpoint
async function testProvidersAPI() {
  try {
    console.log('🧪 Testing Providers API Endpoint...\n');
    
    const BACKEND_URL = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
    
    // First, let's test without authentication to see if the endpoint exists
    console.log('1. Testing endpoint accessibility...');
    const testResponse = await fetch(`${BACKEND_URL}/api/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${testResponse.status}`);
    console.log(`Status Text: ${testResponse.statusText}`);
    
    const testData = await testResponse.text();
    console.log('Response preview:', testData.substring(0, 200));
    
    if (testResponse.status === 401) {
      console.log('\n❗ Authentication required. Testing with admin token...');
      
      // Try to get admin token first
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'info@solutilconnect.com',
          password: 'SoluAdmin2025!'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        console.log('✅ Admin login successful, testing with token...');
        
        // Test with authentication
        const authResponse = await fetch(`${BACKEND_URL}/api/providers?featured=true&limit=3`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`\n2. With Authentication:`);
        console.log(`Status: ${authResponse.status}`);
        console.log(`Status Text: ${authResponse.statusText}`);
        
        if (authResponse.ok) {
          const data = await authResponse.json();
          console.log('\n✅ API Response:');
          console.log(JSON.stringify(data, null, 2));
        } else {
          const errorText = await authResponse.text();
          console.log('\n❌ Error Response:', errorText);
        }
        
      } else {
        console.log('❌ Admin login failed');
        const loginError = await loginResponse.text();
        console.log('Login error:', loginError);
      }
    } else if (testResponse.ok) {
      try {
        const data = JSON.parse(testData);
        console.log('\n✅ API Response (without auth):');
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('\n❌ Response not valid JSON:', testData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testProvidersAPI();