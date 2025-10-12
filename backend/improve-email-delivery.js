require('dotenv').config();
const nodemailer = require('nodemailer');

async function improveEmailDeliverability() {
  console.log('🚀 IMPLEMENTING EMAIL DELIVERABILITY IMPROVEMENTS\n');
  
  // 1. Test with improved SMTP configuration
  console.log('📧 TESTING ENHANCED SMTP CONFIGURATION:');
  
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
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10 // Limit to 10 messages per second
    });
    
    await transporter.verify();
    console.log('   ✅ Enhanced SMTP connection verified');
    
    // 2. Send a properly formatted email
    console.log('\n📧 SENDING PROPERLY FORMATTED EMAIL:');
    
    const mailOptions = {
      from: {
        name: 'SolUtil Platform',
        address: process.env.EMAIL_USER
      },
      to: 'bed-atslmr112025@spu.ac.ke',
      subject: 'Email Verification - SolUtil Platform',
      text: `
Dear User,

Welcome to SolUtil Platform!

Please verify your email address by clicking the link below:
http://localhost:3000/auth/verify-email/test-token-${Date.now()}

If you didn't create an account with SolUtil, please ignore this email.

Best regards,
SolUtil Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - SolUtil</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #ea580c; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SolUtil Platform</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0;">Email Verification Required</p>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #333333; margin-bottom: 20px;">Welcome to SolUtil!</h2>
              
              <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining SolUtil Platform. To complete your registration and secure your account, 
                please verify your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/auth/verify-email/test-token-${Date.now()}" 
                   style="background-color: #ea580c; color: #ffffff; padding: 15px 30px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666666; line-height: 1.6; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="http://localhost:3000/auth/verify-email/test-token-${Date.now()}" 
                   style="color: #ea580c; word-break: break-all;">
                  http://localhost:3000/auth/verify-email/test-token-${Date.now()}
                </a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              
              <p style="color: #999999; font-size: 12px; line-height: 1.4;">
                If you didn't create an account with SolUtil, please ignore this email.<br>
                This verification link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © 2025 SolUtil Platform. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      headers: {
        'List-Unsubscribe': '<mailto:infosolu31@gmail.com>',
        'X-Entity-Ref-ID': 'solutil-verification',
        'X-Auto-Response-Suppress': 'All',
        'Precedence': 'bulk'
      },
      messageId: `solutil-verification-${Date.now()}@gmail.com`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`   ✅ Enhanced email sent successfully`);
    console.log(`   📋 Message ID: ${info.messageId}`);
    console.log(`   📮 Response: ${info.response}`);
    
    transporter.close(); // Close the connection pool
    
  } catch (error) {
    console.log(`   ❌ Enhanced email failed: ${error.message}`);
  }
  
  console.log('\n🎯 RECOMMENDED PERMANENT SOLUTIONS:\n');
  
  console.log('1. 📧 UPGRADE EMAIL SERVICE:');
  console.log('   • Switch to SendGrid, AWS SES, or Mailgun');
  console.log('   • Better deliverability and reputation');
  console.log('   • Detailed delivery tracking');
  
  console.log('\n2. 🔧 IMPLEMENT EMAIL DELIVERY MONITORING:');
  console.log('   • Track email delivery status');
  console.log('   • Retry failed deliveries');
  console.log('   • Log delivery failures');
  
  console.log('\n3. 🎛️ ADD ALTERNATIVE VERIFICATION:');
  console.log('   • SMS verification option');
  console.log('   • Admin manual verification');
  console.log('   • Backup email addresses');
  
  console.log('\n4. 🏢 INSTITUTIONAL EMAIL CONSIDERATIONS:');
  console.log('   • SPU may block external automated emails');
  console.log('   • Contact SPU IT to whitelist your domain');
  console.log('   • Use a custom domain (yourapp.com)');
  
  process.exit(0);
}

improveEmailDeliverability().catch(console.error);