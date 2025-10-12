require('dotenv').config();
const { sendEmail } = require('./utils/email');

async function debugEmailDelivery() {
  console.log('🔍 DEBUGGING EMAIL DELIVERY ISSUE\n');

  // Test email addresses
  const testEmails = [
    'bed-atslmr112025@spu.ac.ke', // Your email that's not receiving
    'infosolu31@gmail.com',       // Your Gmail that works
    'testdelivery@gmail.com'      // Generic test
  ];

  console.log('📧 EMAIL CONFIGURATION:');
  console.log(`   From: ${process.env.EMAIL_USER || process.env.SMTP_USER}`);
  console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`   USE_REAL_SMTP: ${process.env.USE_REAL_SMTP}`);

  for (const email of testEmails) {
    console.log(`\n🎯 TESTING EMAIL TO: ${email}`);
    
    try {
      const result = await sendEmail({
        email: email,
        subject: `Delivery Test - ${new Date().toISOString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ea580c;">Email Delivery Test</h2>
            <p>This is a test email to debug delivery issues.</p>
            <p><strong>Sent to:</strong> ${email}</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From SolUtil System</strong></p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Debugging Information:</h3>
              <p>• If you receive this email, delivery is working</p>
              <p>• Check spam/junk folder if not in inbox</p>
              <p>• Gmail might be filtering based on content or frequency</p>
            </div>
            
            <p>If you see this, email delivery is functional!</p>
          </div>
        `
      });

      console.log(`   ✅ Email sent successfully!`);
      console.log(`   📧 Message ID: ${result.messageId}`);
      console.log(`   📮 SMTP Response: ${result.response}`);

    } catch (error) {
      console.log(`   ❌ Failed to send to ${email}`);
      console.log(`   🚫 Error: ${error.message}`);
    }

    // Wait a bit between sends to avoid spam detection
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🔧 POSSIBLE REASONS FOR MISSING EMAILS:\n');
  
  console.log('1. UNIVERSITY EMAIL FILTERING:');
  console.log('   • University emails (*.spu.ac.ke) often have strict spam filters');
  console.log('   • They may block external SMTP servers like Gmail');
  console.log('   • Check with your IT department about email filtering policies\n');

  console.log('2. GMAIL SENDER REPUTATION:');
  console.log('   • Gmail might be flagging emails from new senders');
  console.log('   • Multiple test emails can trigger spam detection');
  console.log('   • Consider using a professional email service\n');

  console.log('3. EMAIL CONTENT FILTERING:');
  console.log('   • Words like "verification" can trigger spam filters');
  console.log('   • HTML emails are more likely to be filtered');
  console.log('   • Try plain text emails for better delivery\n');

  console.log('4. VOLUME-BASED FILTERING:');
  console.log('   • Sending many emails in short time can trigger blocks');
  console.log('   • Gmail has daily sending limits');
  console.log('   • Consider implementing email queuing\n');

  console.log('💡 IMMEDIATE SOLUTIONS:\n');
  
  console.log('1. CHECK SPAM FOLDER:');
  console.log('   • Look in spam/junk folder for recent emails');
  console.log('   • Mark SolUtil emails as "Not Spam" if found\n');

  console.log('2. USE DIFFERENT EMAIL:');
  console.log('   • Try with a personal Gmail account');
  console.log('   • University emails often have stricter filtering\n');

  console.log('3. WHITELIST SENDER:');
  console.log('   • Add infosolu31@gmail.com to your contacts');
  console.log('   • This improves delivery reputation\n');

  console.log('4. CONTACT IT SUPPORT:');
  console.log('   • Ask your university IT about email filtering');
  console.log('   • They might need to whitelist external senders\n');

  console.log('🎯 VERIFICATION WORKAROUND:');
  console.log('   If emails continue not to arrive, you can:');
  console.log('   1. Set USE_REAL_SMTP=false in .env');
  console.log('   2. Verification URLs will appear in backend console');
  console.log('   3. Copy and paste the URL to verify manually');
}

debugEmailDelivery().catch(console.error);