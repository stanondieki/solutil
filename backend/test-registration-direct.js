// Test the registration endpoint directly
require('dotenv').config();
const axios = require('axios');

async function testRegistration() {
  console.log('🧪 Testing Registration Endpoint...\n');
  
  const API_BASE = process.env.API_BASE || 'http://localhost:5000';
  
  const testUser = {
    name: 'Test Registration User',
    email: 'infosolu31+test@gmail.com', // Using + alias to avoid conflicts
    password: 'testpass123',
    userType: 'client'
  };
  
  console.log('📝 Registering user:', testUser.email);
  console.log('🌐 API Base:', API_BASE);
  
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Registration failed!');
      console.log('Status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

testRegistration().catch(console.error);