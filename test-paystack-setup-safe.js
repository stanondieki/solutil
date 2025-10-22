// Test script to verify Paystack setup (uses environment variables)
const https = require('https');
require('dotenv').config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
  console.log('❌ Missing environment variables:');
  console.log('   PAYSTACK_SECRET_KEY:', !!PAYSTACK_SECRET_KEY ? 'Set' : 'Missing');
  console.log('   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:', !!PAYSTACK_PUBLIC_KEY ? 'Set' : 'Missing');
  console.log('\nPlease set these in your .env file');
  process.exit(1);
}

console.log('🧪 Testing Paystack Configuration...');
console.log('📋 Environment: TEST MODE');
console.log('🔑 Public Key:', PAYSTACK_PUBLIC_KEY.substring(0, 15) + '...');
console.log('🔐 Secret Key:', PAYSTACK_SECRET_KEY.substring(0, 15) + '...');

// Test 1: Verify Paystack API connection
function testPaystackConnection() {
  return new Promise((resolve, reject) => {
    const params = JSON.stringify({
      email: 'test@example.com',
      amount: 100000, // 1000 KES in cents
      currency: 'KES',
      reference: 'test_' + Date.now()
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(params)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status) {
            console.log('✅ API Connection: SUCCESS');
            console.log('📊 Response:', {
              reference: response.data.reference,
              access_code: response.data.access_code?.substring(0, 10) + '...',
              authorization_url: response.data.authorization_url ? 'Generated' : 'Missing'
            });
            resolve(response);
          } else {
            console.log('❌ API Connection: FAILED');
            console.log('📋 Error:', response.message);
            reject(new Error(response.message));
          }
        } catch (error) {
          console.log('❌ API Response: INVALID JSON');
          console.log('📋 Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Network Error:', error.message);
      reject(error);
    });

    req.write(params);
    req.end();
  });
}

// Test 2: Validate key formats
function validateKeyFormats() {
  console.log('\n🔍 Validating Key Formats...');
  
  const publicKeyValid = PAYSTACK_PUBLIC_KEY.startsWith('pk_test_') && PAYSTACK_PUBLIC_KEY.length > 20;
  const secretKeyValid = PAYSTACK_SECRET_KEY.startsWith('sk_test_') && PAYSTACK_SECRET_KEY.length > 20;
  
  console.log('📝 Public key format:', publicKeyValid ? '✅ Valid' : '❌ Invalid');
  console.log('📝 Secret key format:', secretKeyValid ? '✅ Valid' : '❌ Invalid');
  
  return publicKeyValid && secretKeyValid;
}

// Run tests
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Starting Paystack Setup Tests...');
  console.log('='.repeat(50));
  
  try {
    // Test key formats
    const keysValid = validateKeyFormats();
    if (!keysValid) {
      throw new Error('Invalid key formats detected');
    }
    
    // Test API connection
    console.log('\n🌐 Testing API Connection...');
    await testPaystackConnection();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED! Paystack is ready for testing.');
    console.log('💡 Frontend can now use: ' + PAYSTACK_PUBLIC_KEY.substring(0, 15) + '...');
    console.log('💡 Backend can now use: ' + PAYSTACK_SECRET_KEY.substring(0, 15) + '...');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ TEST FAILED:', error.message);
    console.log('🔧 Please check your Paystack configuration');
    console.log('='.repeat(50));
  }
}

runTests();