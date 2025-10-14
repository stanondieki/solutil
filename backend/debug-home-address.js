const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugHomeAddress() {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solutil', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find our test provider
    const testProvider = await User.findOne({ email: 'testprovider@solutil.com' });
    
    if (testProvider) {
      console.log('🔍 Test Provider Found:');
      console.log('ID:', testProvider._id);
      console.log('Name:', testProvider.name);
      console.log('Email:', testProvider.email);
      
      console.log('\n📍 HOME ADDRESS DETAILS:');
      console.log('Provider Profile exists:', !!testProvider.providerProfile);
      
      if (testProvider.providerProfile) {
        console.log('Home Address field exists:', !!testProvider.providerProfile.homeAddress);
        console.log('Home Address content:', testProvider.providerProfile.homeAddress);
        
        if (testProvider.providerProfile.homeAddress) {
          console.log('- Street:', testProvider.providerProfile.homeAddress.street);
          console.log('- Area:', testProvider.providerProfile.homeAddress.area);
          console.log('- Postal Code:', testProvider.providerProfile.homeAddress.postalCode);
        }
      }
      
      console.log('\n🏠 LEGACY ADDRESS FIELD:');
      console.log('Legacy address exists:', !!testProvider.address);
      if (testProvider.address) {
        console.log('Legacy address content:', testProvider.address);
      }
      
      console.log('\n📋 FULL PROVIDER PROFILE STRUCTURE:');
      console.log(JSON.stringify(testProvider.providerProfile, null, 2));
      
    } else {
      console.log('❌ Test provider not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the debug script
debugHomeAddress();