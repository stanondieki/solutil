require('dotenv').config();
const { sendVerificationEmail } = require('./utils/email');

async function testEmailDelivery() {
  console.log('🔍 COMPREHENSIVE EMAIL DELIVERY TEST\n');
  
  const testEmails = [
    { email: 'infosolu31@gmail.com', provider: 'Gmail (sender account)' },
    { email: 'bed-atslmr112025@spu.ac.ke', provider: 'SPU Institutional' },
    { email: 'stanleyondieki0@gmail.com', provider: 'Gmail (external)' },
    { email: 'testdelivery@yahoo.com', provider: 'Yahoo' },
    { email: 'testdelivery@outlook.com', provider: 'Outlook' }
  ];
  
  const results = [];
  
  for (const test of testEmails) {
    console.log(`📧 Testing delivery to: ${test.email} (${test.provider})`);
    
    try {
      const result = await sendVerificationEmail(
        test.email,
        'Test User',
        `http://localhost:3000/auth/verify-email/test-token-${Date.now()}`
      );
      
      console.log(`   ✅ SMTP Response: ${result.response}`);
      console.log(`   📋 Message ID: ${result.messageId}`);
      console.log(`   🎯 Success: ${result.success}`);
      
      results.push({
        email: test.email,
        provider: test.provider,
        success: true,
        messageId: result.messageId,
        response: result.response
      });
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.push({
        email: test.email,
        provider: test.provider,
        success: false,
        error: error.message
      });
    }
    
    console.log(''); // Add spacing
    
    // Wait 2 seconds between sends to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('📊 EMAIL DELIVERY TEST COMPLETE\n');
  console.log('📋 RESULTS SUMMARY:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.email} (${result.provider})`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n💡 Check each email inbox to see actual delivery results');
  console.log('📝 Note: SMTP success doesn\'t guarantee inbox delivery');
  
  process.exit(0);
}

testEmailDelivery().catch(console.error);