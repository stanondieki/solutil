require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userType: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', {
        email: existingAdmin.email,
        name: existingAdmin.name,
        userType: existingAdmin.userType
      });
      return existingAdmin;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@solutil.com',
      password: hashedPassword,
      phone: '+254700000000',
      userType: 'admin',
      isEmailVerified: true,
      status: 'active'
    });

    console.log('✅ Admin user created:', {
      id: adminUser._id,
      email: adminUser.email,
      name: adminUser.name,
      userType: adminUser.userType
    });

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminUser();