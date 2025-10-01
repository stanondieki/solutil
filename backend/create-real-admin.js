const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sendEmail } = require('./utils/email');
require('dotenv').config();

// Admin configuration
const ADMIN_CONFIG = {
  name: 'System Administrator',
  email: 'info@solutilconnect.com', // Updated real admin email
  password: 'SoluAdmin2025!', // Strong password
  phone: '+254712345678',
  userType: 'admin'
};

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

// Send welcome email to admin
const sendAdminWelcomeEmail = async (adminUser) => {
  try {
    const welcomeHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Solutil Admin!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${adminUser.name}!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your administrator account has been successfully created for the Solutil platform. 
            You now have full access to manage the system.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
            <h3 style="margin-top: 0; color: #ea580c;">🔐 Your Admin Credentials</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${adminUser.email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> SoluAdmin2025!</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> Administrator</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">🛡️ Admin Capabilities</h4>
            <ul style="color: #92400e; margin: 10px 0;">
              <li>Manage all users and providers</li>
              <li>Approve/reject provider applications</li>
              <li>Monitor all bookings and transactions</li>
              <li>Access system analytics and reports</li>
              <li>Manage services and categories</li>
              <li>Handle customer support</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.solutilconnect.com/admin/login" 
               style="background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              🚀 Access Admin Panel
            </a>
          </div>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #dc2626;">⚠️ Security Notice</h4>
            <p style="color: #dc2626; margin: 5px 0; font-size: 14px;">
              Please change your password immediately after first login for security purposes.
              Never share your admin credentials with anyone.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            This is an automated message from Solutil Admin System<br>
            Created on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      email: adminUser.email,
      subject: '🎉 Welcome to Solutil Admin - Your Account is Ready!',
      html: welcomeHTML
    });

    console.log('📧 Welcome email sent to admin successfully!');
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
  }
};

async function createRealAdminUser() {
  try {
    await connectDB();
    
    console.log('🔍 Checking for existing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_CONFIG.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🏷️  UserType:', existingAdmin.userType);
      console.log('✅ IsActive:', existingAdmin.isActive);
      console.log('🔓 IsVerified:', existingAdmin.isVerified);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 To create a new admin, delete this user first or use a different email.');
      return existingAdmin;
    }

    console.log('🚀 Creating new admin user...');
    
    // Create admin user
    const adminUser = await User.create({
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password, // Will be hashed by the model
      userType: ADMIN_CONFIG.userType,
      phone: ADMIN_CONFIG.phone,
      isVerified: true, // Admin is pre-verified
      isActive: true,   // Admin is active
      address: {
        city: 'Nairobi',
        country: 'Kenya'
      },
      createdAt: new Date(),
      lastLogin: null
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ADMIN ACCOUNT DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', ADMIN_CONFIG.email);
    console.log('🔐 Password:', ADMIN_CONFIG.password);
    console.log('👤 Name:', ADMIN_CONFIG.name);
    console.log('🏷️  Role: Administrator');
    console.log('✅ Status: Active & Verified');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Frontend Login: https://www.solutilconnect.com/auth/login');
    console.log('🎛️  Admin Panel: https://www.solutilconnect.com/admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Send welcome email
    console.log('📧 Sending welcome email...');
    await sendAdminWelcomeEmail(adminUser);
    
    console.log('🎯 Admin setup completed successfully!');
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 11000) {
      console.log('💡 Duplicate key error - Admin with this email already exists');
    } else if (error.name === 'ValidationError') {
      console.log('💡 Validation error:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Export for use in other scripts
module.exports = { createRealAdminUser, ADMIN_CONFIG };

// Run if called directly
if (require.main === module) {
  createRealAdminUser();
}