const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkProviderImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get approved providers with detailed profile info
    const providers = await User.find({ 
      userType: 'provider', 
      providerStatus: 'approved' 
    }).select('name email profilePicture providerProfile');
    
    console.log(`\n🔍 Checking profile images for ${providers.length} approved providers:\n`);
    
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} (${provider.email})`);
      console.log(`   📸 Profile Picture: ${provider.profilePicture || 'NULL'}`);
      console.log(`   📋 Provider Profile exists: ${provider.providerProfile ? 'YES' : 'NO'}`);
      
      if (provider.providerProfile) {
        console.log(`   💼 Experience: ${provider.providerProfile.experience || 'Not set'}`);
        console.log(`   🛠️  Skills: ${provider.providerProfile.skills?.length || 0} skills`);
        console.log(`   💰 Hourly Rate: ${provider.providerProfile.hourlyRate ? `KES ${provider.providerProfile.hourlyRate}` : 'Not set'}`);
      }
      console.log(`   ─────────────────────────────────────────────────────`);
    });
    
    // Check if any users have profile pictures at all
    const usersWithImages = await User.find({ 
      profilePicture: { $exists: true, $ne: null }
    }).select('name email userType profilePicture');
    
    console.log(`\n📊 Users with profile pictures: ${usersWithImages.length}`);
    if (usersWithImages.length > 0) {
      usersWithImages.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.userType}) - ${user.profilePicture}`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProviderImages();