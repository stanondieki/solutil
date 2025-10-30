require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ userType: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('👤 Found admin user:', {
      email: admin.email,
      name: admin.name,
      userType: admin.userType
    });

    // Reset password to a known value
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await User.findByIdAndUpdate(admin._id, { 
      password: hashedPassword 
    });

    console.log(`✅ Admin password reset to: ${newPassword}`);
    console.log(`📧 Admin email: ${admin.email}`);

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetAdminPassword();