require('dotenv').config();
const jwt = require('jsonwebtoken');

// Function to decode a JWT token without verification (for debugging)
function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    console.log('🔍 Token payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Error decoding token:', error.message);
    return null;
  }
}

console.log('🔧 JWT Token Decoder');
console.log('To check who is currently logged in, you need to:');
console.log('1. Open browser developer tools (F12)');
console.log('2. Go to Application/Storage > Local Storage');
console.log('3. Find the token field and copy its value');
console.log('4. Run: node decode-token.js "YOUR_TOKEN_HERE"');
console.log('');

// Check if token was provided as command line argument
const token = process.argv[2];
if (token) {
  console.log('📋 Decoding provided token...');
  decodeToken(token);
} else {
  console.log('💡 Usage: node decode-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6..."');
}