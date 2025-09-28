// Test what URL is being generated in verification emails
require('dotenv').config();

const { sendWelcomeEmail } = require('./utils/email');

async function testVerificationURL() {
  console.log('🔗 Testing Verification URL Generation...\n');
  
  console.log('Environment Variables:');
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  
  // Mock verification token
  const testToken = 'test-token-12345';
  const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/${testToken}`;
  
  console.log(`\nGenerated URL: ${verificationURL}`);
  console.log(`Expected URL: http://localhost:3000/auth/verify-email/${testToken}`);
  
  try {
    console.log('\n📧 Sending test verification email...');
    await sendWelcomeEmail('infosolu31@gmail.com', 'Test User', verificationURL);
    
    console.log('✅ Test email sent! Check your inbox for the verification URL.');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

testVerificationURL();