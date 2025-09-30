// Verify JWT token compatibility between frontend and backend
const jwt = require('jsonwebtoken');

// The JWT_SECRET both frontend and backend should use
const SHARED_SECRET = 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';

// Simulate backend token creation (what happens during login)
function createBackendToken(userId) {
  return jwt.sign({ userId }, SHARED_SECRET, { expiresIn: '7d' });
}

// Simulate frontend token verification (what happens during upload)
function verifyFrontendToken(token) {
  try {
    return jwt.verify(token, SHARED_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Test the compatibility
console.log('🧪 Testing JWT token compatibility...\n');

// Create a token like the backend does
const testUserId = '68d9b2d4b819a9d389638b0a';
const backendToken = createBackendToken(testUserId);
console.log('✅ Backend created token:', backendToken.substring(0, 50) + '...');

// Verify it like the frontend does
try {
  const decoded = verifyFrontendToken(backendToken);
  console.log('✅ Frontend verified token successfully');
  console.log('   Decoded payload:', decoded);
  
  if (decoded.userId === testUserId) {
    console.log('✅ User ID matches perfectly');
  } else {
    console.log('❌ User ID mismatch');
  }
} catch (error) {
  console.log('❌ Frontend verification failed:', error.message);
}

console.log('\n🎉 JWT compatibility test completed!');

// Test with actual login token from your system
const actualToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ5YjJkNGI4MTlhOWQzODk2MzhiMGEiLCJpYXQiOjE3NTkxODYzOTAsImV4cCI6MTc1OTc5MTE5MH0.wm7JY-sweBO2aN7Ppd4SzjG_IPUHYnNuf24uHGFALVw";

console.log('\n🔍 Testing actual login token...');
try {
  const actualDecoded = verifyFrontendToken(actualToken);
  console.log('✅ Actual token verified successfully');
  console.log('   User ID:', actualDecoded.userId);
  console.log('   Issued at:', new Date(actualDecoded.iat * 1000));
  console.log('   Expires at:', new Date(actualDecoded.exp * 1000));
} catch (error) {
  console.log('❌ Actual token verification failed:', error.message);
  console.log('   This explains the "invalid signature" error');
}