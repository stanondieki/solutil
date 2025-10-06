// Test script to debug the provider update API
const testProviderUpdate = async () => {
  try {
    // First, let's get an admin token (you'll need to replace this with actual admin credentials)
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@solutilconnect.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Admin login successful');

    // Now test the provider update API
    const testProviderId = 'PROVIDER_ID_HERE'; // Replace with actual provider ID
    
    const updateData = {
      name: 'Test Provider',
      email: 'test@provider.com',
      phone: '+1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Kenya'
      },
      providerProfile: {
        businessName: 'Test Business',
        bio: 'Test bio',
        experience: '5 years',
        hourlyRate: 50,
        skills: ['testing'],
        rating: 0
      },
      adminNote: 'Test update from debug script'
    };

    const updateResponse = await fetch(`http://localhost:3000/api/admin/providers/${testProviderId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('Update response status:', updateResponse.status);
    console.log('Update response headers:', Object.fromEntries(updateResponse.headers));

    const responseText = await updateResponse.text();
    console.log('Update response body:', responseText);

    if (updateResponse.ok) {
      console.log('✅ Provider update successful');
    } else {
      console.error('❌ Provider update failed');
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
};

// To run this test:
console.log('Provider Update API Test Script');
console.log('Please replace the credentials and provider ID in the script, then run it in the browser console or Node.js');