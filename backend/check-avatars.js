require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAvatars() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const providers = await User.find({ 
      userType: 'provider', 
      providerStatus: 'approved'
    }).select('name avatar').limit(10);
    
    console.log(`\n📋 Found ${providers.length} approved providers with avatar data:`);
    
    providers.forEach((provider, index) => {
      console.log(`\n👤 Provider ${index + 1}: ${provider.name}`);
      console.log(`   Avatar URL: ${provider.avatar?.url || 'DEFAULT AVATAR'}`);
      console.log(`   Avatar Public ID: ${provider.avatar?.public_id || 'NOT SET'}`);
      
      const hasCustomAvatar = provider.avatar?.url && 
                             provider.avatar.url !== 'https://res.cloudinary.com/solutil/image/upload/v1/defaults/avatar.png';
      
      console.log(`   Status: ${hasCustomAvatar ? '✅ HAS CUSTOM AVATAR' : '📷 USING DEFAULT AVATAR'}`);
    });
    
    // Count providers with custom avatars
    const withCustomAvatars = providers.filter(p => 
      p.avatar?.url && 
      p.avatar.url !== 'https://res.cloudinary.com/solutil/image/upload/v1/defaults/avatar.png'
    ).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Providers: ${providers.length}`);
    console.log(`   With Custom Avatars: ${withCustomAvatars}`);
    console.log(`   Using Default Avatar: ${providers.length - withCustomAvatars}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAvatars();