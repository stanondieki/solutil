// Test script to debug user status and dashboard access
console.log('=== DEBUGGING PROVIDER DASHBOARD ACCESS ===\n');

// Check what's in localStorage
console.log('1. Current localStorage data:');
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('authToken');

if (storedUser) {
  const user = JSON.parse(storedUser);
  console.log('   User Data:', {
    name: user.name,
    email: user.email,
    userType: user.userType,
    providerStatus: user.providerStatus,
    isVerified: user.isVerified
  });
} else {
  console.log('   No user data in localStorage');
}

if (storedToken) {
  console.log('   Auth Token:', storedToken.substring(0, 20) + '...');
} else {
  console.log('   No auth token found');
}

// Test the API endpoint
console.log('\n2. Testing /api/users/profile endpoint:');
if (storedToken) {
  fetch('/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('   API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('   API Response Data:', data);
    if (data.status === 'success' && data.data?.user) {
      const apiUser = data.data.user;
      console.log('   Fresh User Data:', {
        name: apiUser.name,
        email: apiUser.email,
        userType: apiUser.userType,
        providerStatus: apiUser.providerStatus,
        isVerified: apiUser.isVerified,
        approvedAt: apiUser.approvedAt,
        approvedBy: apiUser.approvedBy
      });
      
      // Compare localStorage vs API data
      if (storedUser) {
        const localUser = JSON.parse(storedUser);
        console.log('\n3. Comparison:');
        console.log('   localStorage providerStatus:', localUser.providerStatus);
        console.log('   API providerStatus:', apiUser.providerStatus);
        console.log('   Status Match:', localUser.providerStatus === apiUser.providerStatus);
        
        if (localUser.providerStatus !== apiUser.providerStatus) {
          console.log('   🚨 STATUS MISMATCH DETECTED! This explains the issue.');
          console.log('   💡 Solution: Click the "Refresh Status" button or refresh the page.');
        }
      }
    }
  })
  .catch(error => {
    console.error('   API Error:', error);
  });
} else {
  console.log('   Cannot test API - no auth token');
}

console.log('\n4. Quick Actions Logic Test:');
if (storedUser) {
  const user = JSON.parse(storedUser);
  console.log('   User Type:', user.userType);
  console.log('   Provider Status:', user.providerStatus);
  
  if (user.userType === 'provider') {
    if (user.providerStatus === 'approved') {
      console.log('   ✅ Should show: My Services, Bookings, Analytics');
    } else if (user.providerStatus === 'under_review') {
      console.log('   ⏳ Should show: Application Status');
    } else if (user.providerStatus === 'pending') {
      console.log('   📋 Should show: Complete Setup');
    } else if (user.providerStatus === 'rejected') {
      console.log('   ❌ Should show: Reapply');
    } else {
      console.log('   ❓ Unknown status:', user.providerStatus);
    }
  }
}