// Send a working verification email to your account
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendWelcomeEmail } = require('./utils/email');

async function sendWorkingVerificationEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'bed-artslmr112025@spu.ac.ke' });

    if (user) {
      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
      
      const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}`;
      
      console.log('\n📧 Sending working verification email to your account...');
      console.log(`Email: ${user.email}`);
      console.log(`Verification URL: ${verificationURL}`);
      
      // Send the email with correct parameters
      await sendWelcomeEmail(user.email, user.name, verificationURL);
      
      console.log('\n✅ Working verification email sent successfully!');
      console.log('📬 Check your inbox at bed-artslmr112025@spu.ac.ke');
      console.log('🔗 The verification button should now work properly!');
      
    } else {
      console.log('❌ User not found');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendWorkingVerificationEmail();