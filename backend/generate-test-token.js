// Get the actual verification token for testing
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const crypto = require('crypto');

async function getVerificationToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ 
      email: 'bed-artslmr112025@spu.ac.ke',
      emailVerificationToken: { $exists: true }
    });

    if (user) {
      console.log('\n📧 User found:');
      console.log(`Email: ${user.email}`);
      console.log(`Verified: ${user.isVerified}`);
      console.log(`Token expires: ${new Date(user.emailVerificationExpires)}`);
      
      // The token stored in database is hashed, but we need the original token for the URL
      // Let's create a new token for testing
      const originalToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(originalToken).digest('hex');
      
      // Update user with new token
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save({ validateBeforeSave: false });
      
      console.log('\n🔑 New verification token generated:');
      console.log(`Original token: ${originalToken}`);
      console.log(`Verification URL: ${process.env.CLIENT_URL}/auth/verify-email/${originalToken}`);
      console.log(`\n🧪 Test this URL in your browser or test with curl:`);
      console.log(`curl http://localhost:5000/api/auth/verify-email/${originalToken}`);
      
    } else {
      console.log('❌ User not found or no verification token');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getVerificationToken();