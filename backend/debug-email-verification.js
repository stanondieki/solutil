require('dotenv').config();
const { sendVerificationEmail } = require('./utils/email');

async function debugEmailVerificationIssue() {
  console.log('🔍 DEBUGGING EMAIL VERIFICATION ISSUE\n');

  // 1. Check environment configuration
  console.log('1️⃣ ENVIRONMENT CONFIGURATION:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);
  console.log(`   SMTP_PROVIDER: ${process.env.SMTP_PROVIDER || 'gmail (default)'}`);
  console.log('');

  console.log('2️⃣ EMAIL SETTINGS:');
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || process.env.SMTP_HOST || 'Not set'}`);
  console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || process.env.SMTP_PORT || '587 (default)'}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || process.env.SMTP_USER || 'Not set'}`);
  console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS || process.env.SMTP_PASS ? 'Set' : 'Not set'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`   EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'SolUtil Service (default)'}`);
  console.log('');

  console.log('3️⃣ CLIENT CONFIGURATION:');
  console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || 'Not set'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log('');

  // Check if essential email config is missing
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;

  if (!emailUser || !emailPass) {
    console.log('❌ ISSUE IDENTIFIED: Missing email credentials!');
    console.log('');
    console.log('🔧 TO FIX THIS ISSUE:');
    console.log('   Add these variables to your .env file:');
    console.log('');
    console.log('   # Gmail Configuration (Recommended)');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-gmail-app-password');
    console.log('   EMAIL_FROM=your-email@gmail.com');
    console.log('   EMAIL_FROM_NAME=SolUtil Service');
    console.log('   USE_REAL_SMTP=true');
    console.log('');
    console.log('📋 How to get Gmail App Password:');
    console.log('   1. Go to your Gmail account settings');
    console.log('   2. Enable 2-Factor Authentication');
    console.log('   3. Generate an "App Password" for mail');
    console.log('   4. Use that 16-character password in EMAIL_PASS');
    console.log('');
    return;
  }

  // 4. Test email sending
  console.log('4️⃣ TESTING EMAIL FUNCTIONALITY:');
  
  try {
    console.log('📧 Attempting to send test verification email...');
    
    const testEmail = 'test@example.com'; // Replace with your email for testing
    const verificationURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify-email/test-token-${Date.now()}`;
    
    console.log(`   To: ${testEmail}`);
    console.log(`   Verification URL: ${verificationURL}`);
    
    const result = await sendVerificationEmail(testEmail, 'Test User', verificationURL);
    
    console.log('✅ Verification email sent successfully!');
    console.log('   Result:', result);
    
    console.log('');
    console.log('🎯 EMAIL VERIFICATION IS WORKING!');
    console.log('   If you\'re not receiving emails, check:');
    console.log('   1. Your spam/junk folder');
    console.log('   2. Email address spelling');
    console.log('   3. Gmail app password is correct');
    console.log('   4. 2FA is enabled on Gmail account');
    
  } catch (error) {
    console.log('❌ EMAIL SENDING FAILED!');
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    // Specific error diagnosis
    if (error.message.includes('Invalid login')) {
      console.log('🔐 AUTHENTICATION ERROR:');
      console.log('   - Check your Gmail app password');
      console.log('   - Ensure 2FA is enabled on your Gmail account');
      console.log('   - Verify EMAIL_USER and EMAIL_PASS are correct');
    } else if (error.message.includes('Connection')) {
      console.log('🌐 CONNECTION ERROR:');
      console.log('   - Check your internet connection');
      console.log('   - Verify EMAIL_HOST and EMAIL_PORT settings');
    } else if (error.message.includes('Missing credentials')) {
      console.log('📝 CREDENTIALS ERROR:');
      console.log('   - Add EMAIL_USER and EMAIL_PASS to your .env file');
    } else {
      console.log('🔍 UNKNOWN ERROR:');
      console.log('   - Check all email environment variables');
      console.log('   - Ensure .env file is in the root directory');
    }
  }

  console.log('');
  console.log('💡 QUICK SOLUTION:');
  console.log('   If you want to test signup without email:');
  console.log('   1. Set USE_REAL_SMTP=false in .env');
  console.log('   2. Check the backend console for verification URLs');
  console.log('   3. Or manually verify users in the database');
}

debugEmailVerificationIssue();