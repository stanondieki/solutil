// Quick test to send a real email to your inbox
require('dotenv').config();

const { sendTestEmail } = require('./utils/email');

async function testRealEmail() {
  console.log('🚀 Testing Real Email Delivery...\n');
  
  // Your email address to test with
  const testEmail = 'infosolu31@gmail.com'; // Using your own email
  
  console.log(`📧 Sending test email to: ${testEmail}`);
  console.log(`📤 Using SMTP: ${process.env.EMAIL_HOST}`);
  console.log(`👤 From: ${process.env.EMAIL_FROM}`);
  console.log(`🔑 Real SMTP Enabled: ${process.env.USE_REAL_SMTP}\n`);
  
  try {
    await sendTestEmail(testEmail);
    console.log('✅ Real email sent successfully!');
    console.log('📬 Check your inbox at infosolu31@gmail.com');
    console.log('📁 If not in inbox, check spam/junk folder');
  } catch (error) {
    console.error('❌ Failed to send real email:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Gmail App Password Issue:');
      console.log('1. Make sure 2-Factor Authentication is enabled');
      console.log('2. Generate a new App Password from Google Account Settings');
      console.log('3. Update EMAIL_PASS in your .env file');
    }
  }
}

testRealEmail();