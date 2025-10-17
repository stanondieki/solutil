const mongoose = require('mongoose');
require('dotenv').config();

/**
 * CHECK PROVIDER PROFILE PICTURES
 * Analyze current provider image data and enhance it
 */

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function checkProviderImages() {
  try {
    console.log('🖼️  ANALYZING PROVIDER PROFILE PICTURES');
    console.log('=====================================\n');
    
    await connectDB();
    
    const User = require('./models/User');
    
    // Get all approved providers
    const providers = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    }).select('name email profilePicture providerProfile');
    
    console.log(`📊 Analyzing ${providers.length} approved providers...\n`);
    
    const imageStats = {
      withImages: 0,
      withoutImages: 0,
      cloudinaryImages: 0,
      localImages: 0,
      brokenImages: 0,
      providers: []
    };
    
    for (const provider of providers) {
      const imageData = {
        name: provider.name,
        profilePicture: provider.profilePicture,
        status: 'no-image',
        imageType: 'none'
      };
      
      if (provider.profilePicture) {
        imageStats.withImages++;
        imageData.status = 'has-image';
        
        if (provider.profilePicture.includes('cloudinary.com')) {
          imageStats.cloudinaryImages++;
          imageData.imageType = 'cloudinary';
        } else if (provider.profilePicture.startsWith('http')) {
          imageData.imageType = 'external';
        } else if (provider.profilePicture.startsWith('/uploads')) {
          imageStats.localImages++;
          imageData.imageType = 'local';
        } else {
          imageStats.brokenImages++;
          imageData.imageType = 'unknown';
        }
      } else {
        imageStats.withoutImages++;
      }
      
      imageStats.providers.push(imageData);
      
      console.log(`👤 ${provider.name}`);
      console.log(`   Image: ${imageData.status}`);
      console.log(`   Type: ${imageData.imageType}`);
      console.log(`   URL: ${provider.profilePicture || 'None'}`);
      console.log('');
    }
    
    console.log('📊 IMAGE STATISTICS:');
    console.log(`   Total providers: ${providers.length}`);
    console.log(`   With images: ${imageStats.withImages}`);
    console.log(`   Without images: ${imageStats.withoutImages}`);
    console.log(`   Cloudinary images: ${imageStats.cloudinaryImages}`);
    console.log(`   Local images: ${imageStats.localImages}`);
    console.log(`   Broken/Unknown: ${imageStats.brokenImages}`);
    console.log('');
    
    // Show providers without images
    const noImageProviders = imageStats.providers.filter(p => p.status === 'no-image');
    if (noImageProviders.length > 0) {
      console.log('⚠️  PROVIDERS WITHOUT IMAGES:');
      noImageProviders.forEach(provider => {
        console.log(`   - ${provider.name}`);
      });
      console.log('');
    }
    
    await mongoose.connection.close();
    console.log('💾 Database connection closed\n');
    
    return imageStats;
    
  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    throw error;
  }
}

// Run the analysis
if (require.main === module) {
  checkProviderImages();
}

module.exports = { checkProviderImages };