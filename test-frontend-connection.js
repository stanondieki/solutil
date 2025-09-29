// Frontend-Backend Connection Test
// Run this in your browser console on your Vercel-deployed frontend

console.log('🧪 Testing Frontend-Backend Connection...');
console.log('=====================================');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Socket URL:', process.env.NEXT_PUBLIC_SOCKET_URL);
console.log('Environment:', process.env.NEXT_PUBLIC_ENVIRONMENT);
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);

// Test backend health
console.log('\n🏥 Testing Backend Health...');
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
  .then(response => {
    console.log('✅ Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Backend Response:', data);
    console.log('✅ Environment:', data.environment);
    console.log('✅ Status:', data.status);
  })
  .catch(error => {
    console.error('❌ Backend Connection Failed:', error);
    console.log('🔧 Check if NEXT_PUBLIC_API_URL is set correctly');
  });

// Test services endpoint
console.log('\n🛍️ Testing Services API...');
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`)
  .then(response => response.json())
  .then(data => {
    console.log('✅ Services Data:', data);
    console.log(`✅ Found ${data.results} services`);
  })
  .catch(error => {
    console.error('❌ Services API Failed:', error);
  });

console.log('\n🎉 Test completed! Check results above.');
console.log('Expected API URL: https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net');