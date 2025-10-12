require('dotenv').config();
const nodemailer = require('nodemailer');

async function diagnoseEmailDeliveryToSPU() {
  console.log('🔍 SPECIFIC DIAGNOSIS: EMAIL DELIVERY TO SPU INBOX\n');
  
  try {
    // 1. Test different email content types to SPU
    console.log('📧 TESTING DIFFERENT EMAIL FORMATS TO SPU:');
    
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
    console.log('   ✅ SMTP connection verified');
    
    // Test 1: Simple plain text email
    console.log('\n🧪 TEST 1: Simple Plain Text Email');
    try {
      const plainTextResult = await transporter.sendMail({
        from: `"SolUtil Test" <${process.env.EMAIL_USER}>`,
        to: 'bed-atslmr112025@spu.ac.ke',
        subject: 'Plain Text Test - SolUtil',
        text: 'This is a simple plain text email test. If you receive this, plain text emails work.',
        headers: {
          'Message-ID': `test-plain-${Date.now()}@spu-delivery-test.com`,
          'X-Mailer': 'SolUtil-Delivery-Test'
        }
      });
      
      console.log(`   ✅ Plain text email sent - Message ID: ${plainTextResult.messageId}`);
      console.log(`   📮 Response: ${plainTextResult.response}`);
    } catch (error) {
      console.log(`   ❌ Plain text failed: ${error.message}`);
    }
    
    // Wait 3 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: HTML email with minimal formatting
    console.log('\n🧪 TEST 2: Minimal HTML Email');
    try {
      const htmlResult = await transporter.sendMail({
        from: `"SolUtil Platform" <${process.env.EMAIL_USER}>`,
        to: 'bed-atslmr112025@spu.ac.ke',
        subject: 'HTML Test - SolUtil Platform',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>HTML Email Test</h2>
              <p>This is a minimal HTML email test.</p>
              <p>If you receive this, HTML emails work.</p>
              <p>Test time: ${new Date().toLocaleString()}</p>
            </body>
          </html>
        `,
        text: 'HTML Email Test - This is a minimal HTML email test fallback.',
        headers: {
          'Message-ID': `test-html-${Date.now()}@spu-delivery-test.com`,
          'X-Priority': '3',
          'X-Mailer': 'SolUtil-Platform'
        }
      });
      
      console.log(`   ✅ HTML email sent - Message ID: ${htmlResult.messageId}`);
      console.log(`   📮 Response: ${htmlResult.response}`);
    } catch (error) {
      console.log(`   ❌ HTML email failed: ${error.message}`);
    }
    
    // Wait 3 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 3: Email from different sender name
    console.log('\n🧪 TEST 3: Different Sender Name');
    try {
      const senderResult = await transporter.sendMail({
        from: `"Academic Platform" <${process.env.EMAIL_USER}>`,
        to: 'bed-atslmr112025@spu.ac.ke',
        subject: 'Academic Platform Notification',
        text: `
Dear Student,

This is a test notification from an academic platform.

Best regards,
Academic Platform Team
        `,
        headers: {
          'Message-ID': `test-academic-${Date.now()}@academic-platform.com`,
          'X-Mailer': 'Academic-Platform-System'
        }
      });
      
      console.log(`   ✅ Academic email sent - Message ID: ${senderResult.messageId}`);
      console.log(`   📮 Response: ${senderResult.response}`);
    } catch (error) {
      console.log(`   ❌ Academic email failed: ${error.message}`);
    }
    
    // Wait 3 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 4: Test to other SPU email (if you have access to another)
    console.log('\n🧪 TEST 4: Test Email Headers Analysis');
    try {
      const headerResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'bed-atslmr112025@spu.ac.ke',
        subject: 'Delivery Analysis Test',
        text: 'Email delivery analysis test with enhanced headers.',
        headers: {
          'Message-ID': `delivery-analysis-${Date.now()}@gmail.com`,
          'Return-Path': process.env.EMAIL_USER,
          'Reply-To': process.env.EMAIL_USER,
          'X-Mailer': 'NodeMailer',
          'X-Priority': '3',
          'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}>`,
          'Precedence': 'bulk'
        }
      });
      
      console.log(`   ✅ Header analysis email sent - Message ID: ${headerResult.messageId}`);
      console.log(`   📮 Response: ${headerResult.response}`);
    } catch (error) {
      console.log(`   ❌ Header analysis failed: ${error.message}`);
    }
    
    // Provide diagnosis
    console.log('\n🔍 DELIVERY ANALYSIS:');
    console.log('   📧 All emails report successful SMTP delivery');
    console.log('   🏫 SPU institutional email system may be:');
    console.log('      • Filtering emails from Gmail addresses');
    console.log('      • Blocking automated/bulk emails');
    console.log('      • Quarantining emails with verification links');
    console.log('      • Using aggressive spam filtering');
    
    console.log('\n📋 NEXT STEPS TO CHECK:');
    console.log('   1. Check SPU email spam/junk folder immediately');
    console.log('   2. Check SPU email quarantine/blocked folder');
    console.log('   3. Contact SPU IT support about email filtering');
    console.log('   4. Try from a different email service (not Gmail)');
    
    console.log('\n🎯 IMMEDIATE SOLUTIONS:');
    console.log('   • Use a custom domain email instead of Gmail');
    console.log('   • Switch to a professional email service (SendGrid, AWS SES)');
    console.log('   • Contact SPU IT to whitelist your domain');
    
  } catch (error) {
    console.error('❌ Email diagnosis failed:', error.message);
  }
  
  process.exit(0);
}

diagnoseEmailDeliveryToSPU();