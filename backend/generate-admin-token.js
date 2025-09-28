const jwt = require('jsonwebtoken');

// JWT secret from your .env file
const JWT_SECRET = 'your-super-secure-jwt-secret-key-2024';

// Real admin user ID from the database
const adminUserId = '68cb5afb22e2322331a8831b';

// Create admin token
const adminToken = jwt.sign(
  { userId: adminUserId },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Admin Token Generated:');
console.log(adminToken);
console.log('\nTest the admin services endpoint with this token:');
console.log(`curl -H "Authorization: Bearer ${adminToken}" http://localhost:5000/api/admin/services`);