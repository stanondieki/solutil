require('dotenv').config();

console.log('📧 EMAIL CONFIGURATION CHECK:\n');

console.log('Environment Variables:');
console.log(`USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);
console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
console.log(`EMAIL_SECURE: ${process.env.EMAIL_SECURE}`);
console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not Set'}`);
console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);

console.log('\n🔍 CHECKING EMAIL SENDING FUNCTION:');

// Test if the email utility exists and can be imported
try {
  const { sendVerificationEmail } = require('./utils/email');
  console.log('✅ Email utility imported successfully');
  
  // Test email configuration
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  console.log('✅ Email transporter created');
  
  // Test the connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ SMTP Connection Error:', error.message);
    } else {
      console.log('✅ SMTP Connection verified successfully');
    }
  });

} catch (error) {
  console.log('❌ Email utility import failed:', error.message);
}

console.log('\n🎯 TROUBLESHOOTING STEPS:');
console.log('1. Check spam folder in your email');
console.log('2. Verify email address spelling during registration');
console.log('3. Try registering with infosolu31@gmail.com (the sender email)');
console.log('4. Check if Gmail is blocking emails to itself');
console.log('5. Try using a different email provider (Yahoo, Outlook, etc.)');

console.log('\n🔧 QUICK EMAIL TEST:');
console.log('If you want to manually send a test email, run:');
console.log('node debug-email-verification.js');