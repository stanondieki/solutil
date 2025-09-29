const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

async function getAdminInfo() {
  try {
    await connectDB();
    
    console.log('🔍 Fetching admin user information...');
    
    // Find the admin user
    const adminUser = await User.findOne({ 
      email: 'infosolu31@gmail.com',
      userType: 'admin' 
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 ADMIN ACCOUNT INFORMATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🆔 User ID:', adminUser._id);
    console.log('🏷️  UserType:', adminUser.userType);
    console.log('✅ IsActive:', adminUser.isActive);
    console.log('🔓 IsVerified:', adminUser.isVerified);
    console.log('📱 Phone:', adminUser.phone);
    console.log('📅 Created:', adminUser.createdAt);
    
    // Generate admin token for API testing
    const adminToken = jwt.sign(
      { 
        userId: adminUser._id,
        email: adminUser.email,
        userType: adminUser.userType 
      },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_development_key_123456789',
      { expiresIn: '7d' }
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: infosolu31@gmail.com');
    console.log('Password: AdminSolu2024!');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 ACCESS URLS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Live Site: https://www.solutilconnect.com');
    console.log('🚪 Login Page: https://www.solutilconnect.com/auth/login');
    console.log('🎛️  Admin Panel: https://www.solutilconnect.com/admin');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 ADMIN TOKEN (For API Testing)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(adminToken);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 API TESTING COMMANDS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('# Test admin services endpoint');
    console.log(`curl -H "Authorization: Bearer ${adminToken}" https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/admin/services`);
    console.log('');
    console.log('# Test admin users endpoint');
    console.log(`curl -H "Authorization: Bearer ${adminToken}" https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/admin/users`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 ADMIN PRIVILEGES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Manage all users and providers');
    console.log('✅ Approve/reject provider applications');
    console.log('✅ View all bookings and transactions');
    console.log('✅ Access system analytics');
    console.log('✅ Manage services and categories');
    console.log('✅ Handle customer support');
    console.log('✅ Full system administration');
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error fetching admin info:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Export for use in other scripts
module.exports = { getAdminInfo };

// Run if called directly
if (require.main === module) {
  getAdminInfo();
}