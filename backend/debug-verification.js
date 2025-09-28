// Test to debug email verification tokens
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugVerificationTokens() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find users with verification tokens
    const usersWithTokens = await User.find({
      emailVerificationToken: { $exists: true },
      emailVerificationExpires: { $gt: Date.now() }
    }).select('email emailVerificationToken emailVerificationExpires isVerified');

    console.log('\n📧 Users with active verification tokens:');
    console.log('Total users with tokens:', usersWithTokens.length);
    
    usersWithTokens.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Token expires: ${new Date(user.emailVerificationExpires)}`);
      console.log(`   Token exists: ${!!user.emailVerificationToken}`);
    });

    // Find all users for reference
    const allUsers = await User.find({}).select('email isVerified');
    console.log(`\n👥 Total users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Verified: ${user.isVerified}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugVerificationTokens();