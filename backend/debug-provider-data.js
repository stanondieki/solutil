const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugProviderData() {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solutil', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all providers
    const providers = await User.find({ userType: 'provider' }).limit(5);
    console.log(`📊 Found ${providers.length} providers`);

    providers.forEach((provider, index) => {
      console.log(`\n🔍 === PROVIDER ${index + 1} ===`);
      console.log('ID:', provider._id);
      console.log('Name:', provider.name);
      console.log('Email:', provider.email);
      console.log('Phone:', provider.phone);
      console.log('Status:', provider.providerStatus);
      
      console.log('\n📋 Provider Profile:');
      if (provider.providerProfile) {
        console.log('- Experience:', provider.providerProfile.experience);
        console.log('- Bio:', provider.providerProfile.bio ? 'Present' : 'Missing');
        console.log('- Skills/Services:', provider.providerProfile.skills || 'Missing');
        console.log('- Availability:', provider.providerProfile.availability ? 'Present' : 'Missing');
        console.log('- Service Areas:', provider.providerProfile.serviceAreas);
        console.log('- Home Address:', provider.providerProfile.homeAddress ? 'Present' : 'Missing');
        console.log('- Emergency Contact:', provider.providerProfile.emergencyContact ? 'Present' : 'Missing');
        console.log('- Languages:', provider.providerProfile.languages);
        console.log('- Professional Memberships:', provider.providerProfile.professionalMemberships ? 'Present' : 'Missing');
        console.log('- Payment Info:', provider.providerProfile.paymentInfo ? 'Present' : 'Missing');
        console.log('- Material Sourcing:', provider.providerProfile.materialSourcing ? 'Present' : 'Missing');
        console.log('- Portfolio:', provider.providerProfile.portfolio ? 'Present' : 'Missing');
        console.log('- Services (categories):', provider.providerProfile.services ? 'Present' : 'Missing');
        
        // Show detailed structure
        console.log('\n🔍 DETAILED PROVIDER PROFILE STRUCTURE:');
        console.log(JSON.stringify(provider.providerProfile, null, 2));
      } else {
        console.log('❌ No provider profile found!');
      }

      console.log('\n📄 Documents:');
      if (provider.providerDocuments) {
        console.log('Documents present:', Object.keys(provider.providerDocuments));
      } else {
        console.log('❌ No documents found!');
      }

      console.log('\n📸 Profile Picture:', provider.profilePicture || 'Not set');
      console.log('---'.repeat(20));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the debug script
debugProviderData();