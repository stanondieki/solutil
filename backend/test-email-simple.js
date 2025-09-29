require('dotenv').config();
const { sendVerificationEmail } = require('./utils/email');

console.log('🧪 Testing sendVerificationEmail function...');
console.log('Environment check:');
console.log('- USE_REAL_SMTP:', process.env.USE_REAL_SMTP);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- EMAIL_USER exists:', !!process.env.EMAIL_USER);

const testEmailSend = async () => {
  try {
    console.log('\n📤 Attempting to send verification email...');
    
    const result = await sendVerificationEmail(
      'infosolu31@gmail.com',
      'Test User', 
      'http://localhost:3000/verify?token=test-token-123'
    );
    
    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Email failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check specific error types
    if (error.message.includes('Missing credentials')) {
      console.log('\n🔍 Credential debugging:');
      console.log('EMAIL_USER:', process.env.EMAIL_USER);
      console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
    }
  }
  
  process.exit(0);
};

testEmailSend();