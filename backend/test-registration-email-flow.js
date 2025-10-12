require('dotenv').config();
const axios = require('axios');

async function testRegistrationWithEmailVerification() {
  console.log('🧪 TESTING REGISTRATION + EMAIL VERIFICATION\n');

  try {
    // Test registration with a new email
    const testUser = {
      name: 'Test Verification User',
      email: `test.verification.${Date.now()}@gmail.com`, // Unique email
      password: 'password123',
      userType: 'client',
      phone: '+254712345678'
    };

    console.log('1️⃣ TESTING REGISTRATION ENDPOINT:');
    console.log(`   Registering user: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   User Type: ${testUser.userType}`);

    // Make registration request
    const registrationResponse = await axios.post('http://localhost:5000/api/auth/register', testUser);

    console.log('✅ Registration successful!');
    console.log(`   Status: ${registrationResponse.status}`);
    console.log(`   Response: ${registrationResponse.data.message}`);

    if (registrationResponse.data.data?.user) {
      const user = registrationResponse.data.data.user;
      console.log(`   User ID: ${user._id || user.id}`);
      console.log(`   Email Verified: ${user.emailVerified || user.isVerified}`);
    }

    console.log('\n2️⃣ CHECKING VERIFICATION EMAIL:');
    console.log('   📧 If email system is configured correctly,');
    console.log('   you should receive a verification email at:');
    console.log(`   ${testUser.email}`);
    console.log('');
    console.log('   📋 Check:');
    console.log('   ✅ Your inbox');
    console.log('   ✅ Spam/Junk folder'); 
    console.log('   ✅ Backend console logs');

    // Test with a real email for actual verification
    console.log('\n3️⃣ TESTING WITH REAL EMAIL:');
    console.log('   Let\'s test with a real email address you can check...');

    const realTestUser = {
      name: 'Real Email Test',
      email: 'infosolu31@gmail.com', // Use your actual email
      password: 'password123',
      userType: 'client',
      phone: '+254712345679'
    };

    try {
      const realRegistrationResponse = await axios.post('http://localhost:5000/api/auth/register', realTestUser);
      console.log('✅ Real email registration successful!');
      console.log('   📧 Check infosolu31@gmail.com for verification email');
    } catch (realEmailError) {
      if (realEmailError.response?.status === 400 && realEmailError.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, testing email resend...');
        
        // Test email resend endpoint
        try {
          const resendResponse = await axios.post('http://localhost:5000/api/auth/send-verification-email', {
            email: realTestUser.email
          });
          console.log('✅ Verification email resent successfully!');
          console.log('   📧 Check infosolu31@gmail.com for verification email');
        } catch (resendError) {
          console.log('❌ Email resend failed:', resendError.response?.data?.message || resendError.message);
        }
      } else {
        console.log('❌ Real email registration failed:', realEmailError.response?.data?.message || realEmailError.message);
      }
    }

    console.log('\n🎯 VERIFICATION STEPS:');
    console.log('   1. Check your email inbox and spam folder');
    console.log('   2. Look for email from "SolUtil Service"');
    console.log('   3. Click the "Verify Email" button');
    console.log('   4. Should redirect to verification success page');

    console.log('\n💡 DEBUGGING TIPS:');
    console.log('   • If no email received: Check spam folder first');
    console.log('   • Gmail users: Ensure app password is used (not regular password)');
    console.log('   • Check backend logs for email sending errors');
    console.log('   • Verify CLIENT_URL environment variable is correct');

  } catch (error) {
    console.error('❌ Registration test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.data);
      
      // Specific error handling
      if (error.response.status === 400) {
        console.log('\n🔍 COMMON REGISTRATION ISSUES:');
        console.log('   • Email already exists (try a different email)');
        console.log('   • Password too weak (minimum 6 characters)');
        console.log('   • Invalid phone number format');
        console.log('   • Missing required fields');
      } else if (error.response.status === 500) {
        console.log('\n🔍 SERVER ERROR ISSUES:');
        console.log('   • Database connection problem');
        console.log('   • Email configuration error');
        console.log('   • Server configuration issue');
      }
    } else {
      console.error('   Network Error:', error.message);
      console.log('\n🔍 NETWORK ISSUES:');
      console.log('   • Backend server not running (npm start)');
      console.log('   • Wrong backend URL (should be http://localhost:5000)');
    }
  }
}

testRegistrationWithEmailVerification();