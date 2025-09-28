// Test registration email with real SMTP
require('dotenv').config();

const { sendWelcomeEmail } = require('./utils/email');

async function testRegistrationEmail() {
  console.log('🚀 Testing Registration Welcome Email...\n');
  
  console.log('📧 Environment Variables:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);
  
  try {
    await sendWelcomeEmail('infosolu31@gmail.com', {
      name: 'Test User',
      verificationURL: 'http://localhost:3000/auth/verify-email/test-token-123'
    });
    
    console.log('✅ Registration welcome email sent successfully!');
    console.log('📬 Check your inbox at infosolu31@gmail.com');
    
  } catch (error) {
    console.error('❌ Failed to send registration email:', error.message);
  }
}

testRegistrationEmail();