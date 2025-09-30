const { cloudinary } = require('./utils/cloudinary');
require('dotenv').config();

const testCloudinaryConnection = async () => {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not Set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not Set');
    
    // Test connection with a simple API call
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

if (require.main === module) {
  testCloudinaryConnection();
}

module.exports = { testCloudinaryConnection };