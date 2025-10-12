// Test email configuration and send a test email
require('dotenv').config();
const { sendWelcomeEmail } = require('./utils/email');

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log('USE_REAL_SMTP:', process.env.USE_REAL_SMTP);
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
  console.log('SMTP_PROVIDER:', process.env.SMTP_PROVIDER || 'gmail (default)');
  
  console.log('\n📤 Attempting to send test verification email...');
  
  try {
    const testEmail = 'infosolu31@gmail.com'; // Replace with your email
    const testName = 'Test User';
    const verificationURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify-email/test-token-123`;
    
    await sendWelcomeEmail(testEmail, testName, verificationURL);
    console.log('✅ Test email sent successfully!');
    
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.error('Full error:', error);
  }
}

testEmailConfig().catch(console.error);