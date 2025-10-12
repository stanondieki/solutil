require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailEnhanced');

async function testEnhancedEmailDelivery() {
  console.log('🚀 TESTING ENHANCED EMAIL DELIVERY FOR INSTITUTIONAL EMAILS\n');
  
  console.log('📧 Configuration Status:');
  console.log(`   SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   AWS SES: ${process.env.AWS_SES_ACCESS_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Gmail Enhanced: ${process.env.EMAIL_USER ? '✅ Available' : '❌ Not available'}`);
  
  const emailService = process.env.SENDGRID_API_KEY ? 'SendGrid' : 
                      process.env.AWS_SES_ACCESS_KEY ? 'AWS SES' : 
                      'Gmail Enhanced';
  
  console.log(`\n🎯 Using: ${emailService} for better institutional delivery\n`);
  
  try {
    console.log('📤 Sending enhanced verification email to SPU...');
    
    const result = await sendVerificationEmail(
      'bed-atslmr112025@spu.ac.ke',
      'Enhanced Test User',
      `http://localhost:3000/auth/verify-email/enhanced-test-${Date.now()}`
    );
    
    console.log('✅ Enhanced email sent successfully!');
    console.log(`📋 Message ID: ${result.messageId}`);
    console.log(`📮 Response: ${result.response}`);
    
    console.log('\n🎯 ENHANCED FEATURES USED:');
    console.log('   ✅ Professional email headers');
    console.log('   ✅ Institutional-friendly formatting');
    console.log('   ✅ Enhanced spam filter compatibility');
    console.log('   ✅ Better sender reputation');
    console.log('   ✅ Academic-style email template');
    
    console.log('\n📧 CHECK YOUR SPU EMAIL NOW:');
    console.log('   • Check Inbox (should be more likely to appear here)');
    console.log('   • Check Spam/Junk folder');
    console.log('   • Check Quarantine folder');
    console.log('   • Look for "SolUtil Platform" sender');
    
    if (emailService === 'Gmail Enhanced') {
      console.log('\n💡 FOR EVEN BETTER DELIVERY:');
      console.log('   Consider upgrading to SendGrid or AWS SES');
      console.log('   These services have better institutional email delivery rates');
    }
    
  } catch (error) {
    console.error('❌ Enhanced email test failed:', error.message);
    
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check your .env configuration');
    console.log('   2. Verify SMTP credentials');
    console.log('   3. Consider setting up SendGrid for better delivery');
  }
  
  process.exit(0);
}

testEnhancedEmailDelivery();