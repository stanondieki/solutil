require('dotenv').config();
const { sendWelcomeEmail } = require('./utils/email');

async function testRegistrationEmailFlow() {
  console.log('🧪 COMPREHENSIVE REGISTRATION EMAIL TEST\n');

  // Test with the exact same parameters as registration
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com' // Use a test email first
  };

  const verificationToken = 'test-verification-token-123';
  const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}`;

  console.log('📝 TEST PARAMETERS:');
  console.log(`   Name: ${testUser.name}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Verification URL: ${verificationURL}`);
  console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);
  console.log(`   CLIENT_URL: ${process.env.CLIENT_URL}`);

  console.log('\n🔍 EMAIL CONFIGURATION:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? 'Set' : 'Not Set'}`);

  try {
    console.log('\n📧 SENDING WELCOME EMAIL...');
    
    // Call the exact same function used in registration
    const result = await sendWelcomeEmail(testUser.email, testUser.name, verificationURL);
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);

    // Now test with a real email that you can check
    console.log('\n📧 TESTING WITH REAL EMAIL (infosolu31@gmail.com):');
    
    const realResult = await sendWelcomeEmail('infosolu31@gmail.com', 'Real Test User', verificationURL);
    
    console.log('✅ REAL EMAIL SENT SUCCESSFULLY!');
    console.log(`   Message ID: ${realResult.messageId}`);
    console.log(`   Response: ${realResult.response}`);
    console.log('\n📬 CHECK YOUR EMAIL:');
    console.log('   1. Check inbox at infosolu31@gmail.com');
    console.log('   2. Check spam/junk folder');
    console.log('   3. Look for email from "SolUtil Service"');

  } catch (error) {
    console.error('❌ EMAIL SENDING FAILED:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 GMAIL AUTH ISSUES:');
      console.log('   • Make sure you are using an App Password, not your regular Gmail password');
      console.log('   • Enable 2-Factor Authentication on your Gmail account');
      console.log('   • Generate a new App Password at: https://myaccount.google.com/apppasswords');
      console.log('   • Update the SMTP_PASS in your .env file with the new App Password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 CONNECTION ISSUES:');
      console.log('   • Check your internet connection');
      console.log('   • Gmail SMTP might be blocked by firewall');
      console.log('   • Try using port 465 with secure: true instead of 587');
    } else if (error.message.includes('timeout')) {
      console.log('\n🔧 TIMEOUT ISSUES:');
      console.log('   • Network connection might be slow');
      console.log('   • Try again in a few minutes');
      console.log('   • Check if antivirus is blocking SMTP connections');
    }
  }
}

async function testSimpleEmail() {
  console.log('\n🔧 SIMPLE SMTP TEST:');
  
  const nodemailer = require('nodemailer');
  
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    });

    // Verify connection
    console.log('   Testing SMTP connection...');
    await transporter.verify();
    console.log('   ✅ SMTP connection verified!');

    // Send a simple test email
    const info = await transporter.sendMail({
      from: `"SolUtil Service" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: 'infosolu31@gmail.com',
      subject: 'Simple Email Test - SolUtil',
      html: '<p>This is a simple test email to verify SMTP is working.</p>'
    });

    console.log('   ✅ Simple email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    
  } catch (error) {
    console.error('   ❌ Simple email test failed:', error.message);
  }
}

// Run the tests
testRegistrationEmailFlow()
  .then(() => testSimpleEmail())
  .catch(console.error);