const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    
    // Test upload limits
    const usage = await cloudinary.api.usage();
    console.log('\n📊 Account Usage:');
    console.log('Storage used:', Math.round(usage.storage.used_bytes / 1024 / 1024), 'MB');
    console.log('Bandwidth used:', Math.round(usage.bandwidth.used_bytes / 1024 / 1024), 'MB');
    console.log('Transformations used:', usage.transformations.used);
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Fix: Double-check your CLOUDINARY_API_KEY');
    } else if (error.message.includes('Invalid API Secret')) {
      console.log('\n💡 Fix: Double-check your CLOUDINARY_API_SECRET');
    } else if (error.message.includes('Invalid cloud name')) {
      console.log('\n💡 Fix: Double-check your CLOUDINARY_CLOUD_NAME');
    }
  }
}

testCloudinaryConnection();