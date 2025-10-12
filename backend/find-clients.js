require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function findClients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Find all client accounts
    const clients = await User.find({ userType: 'client' });
    console.log(`\n👥 Found ${clients.length} client accounts:`);
    
    clients.forEach((client, index) => {
      console.log(`\n${index + 1}. ${client.name}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   ID: ${client._id}`);
      console.log(`   Verified: ${client.isVerified ? 'Yes' : 'No'}`);
    });

    if (clients.length === 0) {
      console.log('\n❌ No client accounts found!');
      console.log('💡 You need to:');
      console.log('1. Register a new client account through the frontend');
      console.log('2. Or create a test client account');
    } else {
      console.log('\n💡 To create live bookings:');
      console.log('1. Login as one of these clients in the frontend');
      console.log('2. Navigate to services/browse');
      console.log('3. Find and book Orangi\'s "Lawn mowing" service');
      console.log('4. Complete the booking process');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

findClients();