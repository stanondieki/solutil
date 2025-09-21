// Open browser console at localhost:3000 and run these commands:

// Test Registration
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    userType: 'client',
    phone: '+254712345678'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Registration Success:', data);
  console.log('User Created At:', data.data.user.createdAt);
  console.log('User ID:', data.data.user._id);
})
.catch(error => console.error('Error:', error));

// Test Login (run after successful registration)
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'testuser@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login Success:', data);
  console.log('Last Login:', data.data.user.lastLogin);
  console.log('JWT Token:', data.token);
})
.catch(error => console.error('Error:', error));
