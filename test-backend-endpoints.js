const backendUrl = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

console.log('Testing backend endpoints...');

// Test base API
fetch(`${backendUrl}/api/test`)
  .then(response => {
    console.log('API test endpoint status:', response.status);
    return response.json();
  })
  .then(data => console.log('API test response:', data))
  .catch(err => console.log('API test error:', err));

// Test notifications endpoint
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZmMjhiZDc0ZWM3NWM0OWZhMDZkMTciLCJlbWFpbCI6Im9uZGlla2lzdGFubGV5MjFAZ21haWwuY29tIiwidXNlclR5cGUiOiJjbGllbnQiLCJpYXQiOjE3NjE3NzQwNzEsImV4cCI6MTc2MjM3ODg3MX0.WAE5fjbMuJJAL0UHVSxgmF_rpSJH6LWi4G9UpujfOxg';

fetch(`${backendUrl}/api/notifications`, {
  headers: {
    'Authorization': `Bearer ${sampleToken}`,
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('Notifications endpoint status:', response.status);
    return response.text();
  })
  .then(data => console.log('Notifications response:', data))
  .catch(err => console.log('Notifications error:', err));