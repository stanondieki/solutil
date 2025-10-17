require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function findClientAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== FINDING CLIENT ACCOUNTS ===');
    
    const clients = await User.find({ userType: 'client' })
      .select('name email userType')
      .limit(10);
    
    console.log('Available client accounts:');
    clients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.name} (${client.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

findClientAccounts();