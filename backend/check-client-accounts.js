require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkClientAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n👤 Available client accounts:');
    const clients = await User.find({ userType: 'client' }).select('name email');
    
    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} - ${client.email}`);
    });

    console.log('\n💡 Note: These are the actual client emails in the database');
    console.log('   You can use any of these emails with password "password" for testing');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkClientAccounts();