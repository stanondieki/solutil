// Test profile picture upload with valid authentication
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ5YjJkNGI4MTlhOWQzODk2MzhiMGEiLCJpYXQiOjE3NTkxODYzOTAsImV4cCI6MTc1OTc5MTE5MH0.wm7JY-sweBO2aN7Ppd4SzjG_IPUHYnNuf24uHGFALVw";

// Test backend upload endpoint
fetch('https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/upload/profile-picture', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: new FormData() // Empty form for now, just testing auth
})
.then(response => response.json())
.then(data => {
  console.log('Backend upload test:', data);
})
.catch(error => {
  console.error('Backend upload error:', error);
});

// Test frontend API endpoint
fetch('https://www.solutilconnect.com/api/upload/profile-picture', {
  method: 'POST', 
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: new FormData() // Empty form for now, just testing auth
})
.then(response => response.json())
.then(data => {
  console.log('Frontend upload test:', data);
})
.catch(error => {
  console.error('Frontend upload error:', error);
});

console.log('Testing upload endpoints with token...');