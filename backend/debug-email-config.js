require('dotenv').config();

console.log('🔍 Debugging email environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('USE_REAL_SMTP:', process.env.USE_REAL_SMTP);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);

// Test the transporter creation logic
const nodemailer = require('nodemailer');

const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

console.log('\n🔧 Resolved credentials:');
console.log('smtpUser:', smtpUser ? '✅ ' + smtpUser : '❌ Missing');
console.log('smtpPass:', smtpPass ? '✅ [HIDDEN]' : '❌ Missing');

if (smtpUser && smtpPass) {
  console.log('\n🚀 Testing transporter creation...');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log('✅ Transporter created successfully');
    
    // Test connection
    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ SMTP connection test failed:', error.message);
      } else {
        console.log('✅ SMTP connection test successful');
      }
      process.exit(0);
    });
  } catch (error) {
    console.log('❌ Error creating transporter:', error.message);
    process.exit(1);
  }
} else {
  console.log('❌ Missing credentials - cannot test transporter');
  process.exit(1);
}