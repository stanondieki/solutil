const { sendVerificationEmail } = require('./utils/email');

// Test email function
const testEmail = async () => {
  console.log('🧪 Testing email configuration...');
  
  try {
    const result = await sendVerificationEmail({
      email: 'infosolu31@gmail.com', // Testing with your own email
      name: 'Test User',
      verificationToken: 'test-token-123'
    });
    
    console.log('✅ Email test successful!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    // Additional debugging info
    if (error.code === 'EAUTH') {
      console.log('🔐 Authentication failed - check your Gmail app password');
    } else if (error.code === 'ECONNECTION') {
      console.log('🌐 Connection failed - check your internet connection');
    }
  }
  
  process.exit(0);
};

// Run the test
testEmail();