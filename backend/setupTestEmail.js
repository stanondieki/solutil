// Email Test Service using Ethereal Email
// This creates temporary email accounts for testing without needing real SMTP credentials

const nodemailer = require('nodemailer');

const setupTestEmailAccount = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('📧 Test Email Account Created:');
    console.log('📧 Email:', testAccount.user);
    console.log('📧 Password:', testAccount.pass);
    console.log('📧 Preview URL will be logged after sending emails');
    
    // Add these to your .env file for testing
    console.log('\n📧 Add these to your .env file:');
    console.log(`SMTP_HOST=smtp.ethereal.email`);
    console.log(`SMTP_PORT=587`);
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`SEND_REAL_EMAILS=true`);
    
    return testAccount;
  } catch (error) {
    console.error('❌ Failed to create test email account:', error.message);
  }
};

// Run this script to get test email credentials
if (require.main === module) {
  setupTestEmailAccount();
}

module.exports = { setupTestEmailAccount };