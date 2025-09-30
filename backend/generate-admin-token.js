const jwt = require('jsonwebtoken');

// JWT secret for production
const JWT_SECRET = 'solutil_production_jwt_secret_2025';

// Real admin user ID from the database
const adminUserId = '68da52c8094493faa9d0c392';

// Create admin token with userType
const adminToken = jwt.sign(
  { 
    userId: adminUserId,
    email: 'infosolu31@gmail.com',
    userType: 'admin' 
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Admin Token Generated:');
console.log(adminToken);
console.log('\nTest the admin services endpoint with this token:');
console.log(`curl -H "Authorization: Bearer ${adminToken}" http://localhost:5000/api/admin/services`);