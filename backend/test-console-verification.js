require('dotenv').config();
const axios = require('axios');

async function testConsoleVerification() {
  console.log('🧪 TESTING CONSOLE VERIFICATION MODE\n');

  const testUser = {
    name: 'Console Test User',
    email: 'consoletest@example.com',
    password: 'password123',
    userType: 'client',
    phone: '+254712345679'
  };

  try {
    console.log('1️⃣ REGISTERING USER...');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);

    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('✅ Registration successful!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.data.message}`);

    console.log('\n2️⃣ CHECK BACKEND CONSOLE ABOVE ⬆️');
    console.log('   Look for a verification URL in the backend logs');
    console.log('   It should look like: http://localhost:3000/auth/verify-email/[token]');
    console.log('   Copy that URL and paste it in your browser to verify');

    console.log('\n3️⃣ TESTING LOGIN (should fail - unverified)...');
    
    try {
      await axios.post('http://localhost:5000/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('✅ Login correctly failed - email not verified');
        console.log(`   Error: ${loginError.response.data.error}`);
        console.log(`   Message: ${loginError.response.data.message}`);
        
        if (loginError.response.data.error === 'EMAIL_NOT_VERIFIED') {
          console.log('✅ Correct error type returned');
        }
      }
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Look in the backend console for the verification URL');
    console.log('2. Copy and paste that URL in your browser');
    console.log('3. You should see a "Email verified successfully" message');
    console.log('4. Then try logging in again');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testConsoleVerification();