const https = require('https');
const http = require('http');

// Admin configuration
const ADMIN_CONFIG = {
  name: 'System Administrator',
  email: 'info@solutilconnect.com',
  password: 'SoluAdmin2025!',
  phone: '+254712345678',
  userType: 'admin'
};

// Backend URL
const BACKEND_URL = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user through API...');
    
    // Try to register the admin user through the registration endpoint
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ADMIN_CONFIG)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Admin Email:', ADMIN_CONFIG.email);
      console.log('🔐 Admin Password:', ADMIN_CONFIG.password);
      console.log('🎯 Login URL: https://www.solutilconnect.com/admin/login');
      console.log('');
      console.log('⚠️  IMPORTANT: Change the password after first login for security!');
    } else {
      console.error('❌ Failed to create admin user:', data.message);
      
      // If user already exists, try to login to verify credentials
      if (data.message && data.message.includes('already exists')) {
        console.log('🔄 User already exists. Attempting to verify credentials...');
        
        const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: ADMIN_CONFIG.email,
            password: ADMIN_CONFIG.password
          })
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.data.user.userType === 'admin') {
          console.log('✅ Admin user already exists and credentials are valid!');
          console.log('📧 Admin Email:', ADMIN_CONFIG.email);
          console.log('🔐 Admin Password:', ADMIN_CONFIG.password);
          console.log('🎯 Login URL: https://www.solutilconnect.com/admin/login');
        } else {
          console.log('❌ Admin user exists but credentials may be different or user is not admin type');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Run the script
createAdminUser();