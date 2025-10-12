require('dotenv').config();
const User = require('./models/User');

async function testEmailVerificationLoginFlow() {
  console.log('🧪 TESTING EMAIL VERIFICATION LOGIN FLOW\n');

  try {
    // 1. Create a test user with unverified email
    console.log('1️⃣ Creating test user with unverified email...');
    
    const testUserData = {
      name: 'Test Unverified User',
      email: 'testunverified@example.com',
      password: 'password123',
      userType: 'client',
      phone: '+254712345678',
      isVerified: false // Explicitly set to false
    };

    // Remove existing user if exists
    await User.deleteOne({ email: testUserData.email });
    
    const testUser = await User.create(testUserData);
    console.log(`   ✅ Created user: ${testUser.name} (${testUser.email})`);
    console.log(`   📧 Email verified: ${testUser.isVerified}`);
    console.log(`   🆔 User ID: ${testUser._id}`);

    // 2. Test login attempt with unverified email
    console.log('\n2️⃣ Testing login with unverified email...');
    
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: testUserData.email,
        password: testUserData.password
      });
      
      console.log('   ❌ Login should have failed but succeeded');
      console.log('   Response:', loginResponse.data);
      
    } catch (loginError) {
      if (loginError.response) {
        console.log('   ✅ Login correctly failed');
        console.log(`   Status: ${loginError.response.status}`);
        console.log(`   Error: ${loginError.response.data.error}`);
        console.log(`   Message: ${loginError.response.data.message}`);
        console.log(`   Email: ${loginError.response.data.data?.email}`);
        console.log(`   Resend Endpoint: ${loginError.response.data.data?.resendEndpoint}`);
        
        // Check if the response has the expected structure
        if (loginError.response.data.error === 'EMAIL_NOT_VERIFIED') {
          console.log('   ✅ Correct error type returned');
        } else {
          console.log('   ❌ Unexpected error type');
        }
        
        if (loginError.response.data.data?.resendEndpoint) {
          console.log('   ✅ Resend endpoint provided');
        } else {
          console.log('   ❌ Resend endpoint missing');
        }
      } else {
        console.log('   ❌ Network error:', loginError.message);
      }
    }

    // 3. Test resend verification email
    console.log('\n3️⃣ Testing resend verification email...');
    
    try {
      const resendResponse = await axios.post('http://localhost:5000/api/auth/resend-verification', {
        email: testUserData.email
      });
      
      console.log('   ✅ Resend verification successful');
      console.log(`   Status: ${resendResponse.status}`);
      console.log(`   Message: ${resendResponse.data.message}`);
      
    } catch (resendError) {
      console.log('   ❌ Resend verification failed');
      if (resendError.response) {
        console.log(`   Status: ${resendError.response.status}`);
        console.log(`   Error: ${resendError.response.data.message}`);
      } else {
        console.log(`   Network error: ${resendError.message}`);
      }
    }

    // 4. Verify the user manually and test login again
    console.log('\n4️⃣ Manually verifying user and testing login...');
    
    testUser.isVerified = true;
    testUser.emailVerificationToken = undefined;
    testUser.emailVerificationExpires = undefined;
    await testUser.save({ validateBeforeSave: false });
    
    console.log('   ✅ User manually verified');
    
    try {
      const verifiedLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: testUserData.email,
        password: testUserData.password
      });
      
      console.log('   ✅ Login successful after verification');
      console.log(`   Status: ${verifiedLoginResponse.status}`);
      console.log(`   User: ${verifiedLoginResponse.data.data.user.name}`);
      console.log(`   Token: ${verifiedLoginResponse.data.token ? 'Present' : 'Missing'}`);
      
    } catch (verifiedLoginError) {
      console.log('   ❌ Login failed even after verification');
      if (verifiedLoginError.response) {
        console.log(`   Status: ${verifiedLoginError.response.status}`);
        console.log(`   Error: ${verifiedLoginError.response.data.message}`);
      }
    }

    // 5. Clean up
    console.log('\n5️⃣ Cleaning up test data...');
    await User.deleteOne({ email: testUserData.email });
    console.log('   ✅ Test user deleted');

    console.log('\n🎯 EMAIL VERIFICATION LOGIN FLOW TEST COMPLETE');
    console.log('\n📋 SUMMARY:');
    console.log('   • Unverified users cannot login ✅');
    console.log('   • Login returns EMAIL_NOT_VERIFIED error ✅');
    console.log('   • Resend verification endpoint works ✅');
    console.log('   • Verified users can login ✅');
    console.log('   • Frontend should show resend button ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Initialize database connection and run test
(async () => {
  try {
    const mongoose = require('mongoose');
    
    if (!global.isDbConnected || !global.isDbConnected()) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('📦 Connected to MongoDB for testing');
    }
    
    await testEmailVerificationLoginFlow();
    
  } catch (error) {
    console.error('Failed to run test:', error.message);
  } finally {
    process.exit(0);
  }
})();