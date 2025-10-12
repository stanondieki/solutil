require('dotenv').config();
const nodemailer = require('nodemailer');

async function analyzeEmailConfiguration() {
  console.log('🔍 ANALYZING EMAIL CONFIGURATION FOR DELIVERABILITY\n');
  
  // 1. Check current configuration
  console.log('📧 CURRENT SMTP CONFIGURATION:');
  console.log(`   Provider: ${process.env.SMTP_PROVIDER || 'gmail'}`);
  console.log(`   Host: ${process.env.SMTP_HOST || process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT || '587'}`);
  console.log(`   Secure: ${process.env.SMTP_SECURE || 'false'}`);
  console.log(`   User: ${process.env.EMAIL_USER || process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
  console.log(`   From Name: ${process.env.EMAIL_FROM_NAME || 'SolUtil Service'}`);
  console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);
  
  // 2. Test SMTP connection
  console.log('\n🔧 TESTING SMTP CONNECTION:');
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    await transporter.verify();
    console.log('   ✅ SMTP connection verified successfully');
    
    // 3. Send a test email with detailed headers
    console.log('\n📧 SENDING TEST EMAIL WITH ENHANCED HEADERS:');
    
    const mailOptions = {
      from: `"SolUtil Service" <${process.env.EMAIL_USER}>`,
      to: 'bed-atslmr112025@spu.ac.ke',
      subject: 'Email Deliverability Test - SolUtil',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>Email Deliverability Test</h1>
          </div>
          <div style="padding: 20px;">
            <h2>This is a deliverability test email</h2>
            <p>If you receive this email, it means our email system is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: ${new Date().toLocaleString()}</li>
              <li>From: SolUtil Service</li>
              <li>Purpose: Email delivery testing</li>
            </ul>
            <p>Please check your spam/junk folder if this email is not in your inbox.</p>
          </div>
        </div>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': '<mailto:infosolu31@gmail.com>',
        'X-Mailer': 'SolUtil Email Service',
        'Reply-To': process.env.EMAIL_USER
      }
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`   ✅ Test email sent successfully`);
    console.log(`   📋 Message ID: ${info.messageId}`);
    console.log(`   📮 Response: ${info.response}`);
    
    if (info.accepted && info.accepted.length > 0) {
      console.log(`   ✅ Accepted by: ${info.accepted.join(', ')}`);
    }
    if (info.rejected && info.rejected.length > 0) {
      console.log(`   ❌ Rejected by: ${info.rejected.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`   ❌ SMTP configuration issue: ${error.message}`);
  }
  
  // 4. Provide recommendations
  console.log('\n💡 DELIVERABILITY RECOMMENDATIONS:');
  console.log('   1. Check SPU email spam/junk folder');
  console.log('   2. Add infosolu31@gmail.com to SPU email whitelist');
  console.log('   3. Consider using a dedicated email service (SendGrid, AWS SES)');
  console.log('   4. Implement SPF, DKIM, and DMARC records');
  console.log('   5. Use a custom domain for sending emails');
  
  console.log('\n🎯 IMMEDIATE SOLUTIONS:');
  console.log('   • Manual verification (current temporary fix)');
  console.log('   • Alternative verification method (SMS, phone)');
  console.log('   • Email delivery status tracking');
  console.log('   • Backup email providers');
  
  process.exit(0);
}

analyzeEmailConfiguration().catch(console.error);