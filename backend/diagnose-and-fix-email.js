require('dotenv').config();
const nodemailer = require('nodemailer');

async function diagnoseThenSendEmail() {
  console.log('🔍 COMPREHENSIVE EMAIL DELIVERY DIAGNOSIS\n');

  // 1. Check environment configuration
  console.log('📧 EMAIL CONFIGURATION:');
  console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   Email Pass Length: ${process.env.EMAIL_PASS?.length || 0}`);
  console.log(`   SMTP Pass Length: ${process.env.SMTP_PASS?.length || 0}`);

  // 2. Test SMTP connection first
  console.log('\n🔌 TESTING SMTP CONNECTION...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('   ✅ SMTP connection successful');
  } catch (error) {
    console.log('   ❌ SMTP connection failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 GMAIL AUTH ISSUE - TRY THIS:');
      console.log('   1. Go to https://myaccount.google.com/security');
      console.log('   2. Enable 2-Factor Authentication');
      console.log('   3. Go to https://myaccount.google.com/apppasswords');
      console.log('   4. Generate a new App Password for "Mail"');
      console.log('   5. Update SMTP_PASS in .env with the new password');
      return;
    }
  }

  // 3. Test different email addresses and methods
  const testEmails = [
    { email: 'infosolu31@gmail.com', description: 'Your own Gmail (sender)' },
    { email: 'stanleyondieki0@gmail.com', description: 'Alternative Gmail' },
    { email: 'test@gmail.com', description: 'Simple test Gmail' }
  ];

  for (const test of testEmails) {
    console.log(`\n📧 TESTING EMAIL TO: ${test.email} (${test.description})`);
    
    try {
      // Create a simple, clean email
      const mailOptions = {
        from: `"SolUtil Test" <${process.env.EMAIL_USER}>`,
        to: test.email,
        subject: `Email Test - ${new Date().toLocaleTimeString()}`,
        text: `
This is a plain text email test from SolUtil.

Sent at: ${new Date().toLocaleString()}
To: ${test.email}
From: SolUtil System

If you receive this, email delivery is working!
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd;">
  <h2 style="color: #ea580c;">✅ Email Delivery Test</h2>
  <p>This is a test email from SolUtil system.</p>
  
  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <strong>Test Details:</strong><br>
    📧 To: ${test.email}<br>
    ⏰ Sent: ${new Date().toLocaleString()}<br>
    🔧 From: SolUtil System
  </div>
  
  <p>✅ If you see this email, delivery is working correctly!</p>
</div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('   ✅ Email sent successfully!');
      console.log(`   📧 Message ID: ${info.messageId}`);
      console.log(`   📮 Response: ${info.response}`);
      
      if (info.accepted && info.accepted.length > 0) {
        console.log(`   ✅ Accepted by: ${info.accepted.join(', ')}`);
      }
      if (info.rejected && info.rejected.length > 0) {
        console.log(`   ❌ Rejected by: ${info.rejected.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Failed to send to ${test.email}`);
      console.log(`   🚫 Error: ${error.message}`);
    }

    // Wait between sends
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n💡 GMAIL DELIVERY TIPS:');
  console.log('   1. Check spam/junk folder for all test emails');
  console.log('   2. If emails are in spam, mark them as "Not Spam"');
  console.log('   3. Add infosolu31@gmail.com to your contacts');
  console.log('   4. Gmail might delay emails by a few minutes');
  console.log('   5. Check "All Mail" folder in Gmail');

  console.log('\n🔧 IF EMAILS STILL NOT ARRIVING:');
  console.log('   • Try a different email provider (Yahoo, Outlook)');
  console.log('   • Check if your Gmail account has email forwarding enabled');
  console.log('   • Verify your Gmail account is not full');
  console.log('   • Try sending from a different Gmail account');

  console.log('\n📱 NEXT STEPS:');
  console.log('   1. Check your Gmail inbox and spam folder now');
  console.log('   2. Look for emails with subject "Email Test - [time]"');
  console.log('   3. If found, try the verification flow again');
  console.log('   4. If not found, let me know and we\'ll try alternative solutions');
}

diagnoseThenSendEmail().catch(console.error);