require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function addProfilePictures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const sampleImages = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b602?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    ];
    
    const providers = await User.find({ 
      userType: 'provider', 
      providerStatus: 'approved' 
    });
    
    console.log(`🖼️ Adding sample profile pictures to ${providers.length} providers...`);
    
    for (let i = 0; i < Math.min(providers.length, 5); i++) {
      const provider = providers[i];
      const imageUrl = sampleImages[i % sampleImages.length];
      
      await User.findByIdAndUpdate(provider._id, {
        profilePicture: imageUrl
      });
      
      console.log(`✅ Updated ${provider.name}: ${imageUrl}`);
    }
    
    console.log('🎉 Sample profile pictures added!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

addProfilePictures();