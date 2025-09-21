const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@solutil.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@solutil.com');
      console.log('You can update the password by deleting the user and running this script again.');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@solutil.com',
      password: 'admin123', // Will be hashed by the model
      userType: 'admin',
      phone: '+254700000000',
      isVerified: true,
      address: {
        city: 'Nairobi',
        country: 'Kenya'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@solutil.com');
    console.log('🔐 Password: admin123');
    console.log('👤 User Type: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Access: Login at http://localhost:3001/auth/login');
    console.log('🎛️  Admin Panel: Will redirect automatically to /admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 Tip: Admin user already exists with this email');
    }
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser();
