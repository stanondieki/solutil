const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function addSampleProfilePictures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Sample profile pictures (you can use any image URLs)
    const sampleImages = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    ];
    
    // Get approved providers
    const providers = await User.find({ 
      userType: 'provider', 
      providerStatus: 'approved' 
    });
    
    console.log(`🖼️  Adding sample profile pictures to ${providers.length} providers...\n`);
    
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const imageUrl = sampleImages[i % sampleImages.length]; // Cycle through images
      
      await User.findByIdAndUpdate(provider._id, {
        profilePicture: imageUrl
      });
      
      console.log(`✅ Updated ${provider.name}: ${imageUrl}`);
    }
    
    console.log('\n🎉 Sample profile pictures added successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment the line below to run this script
// addSampleProfilePictures();