// Test Cloudinary Configuration
const { v2: cloudinary } = require('cloudinary');

// Configure with your credentials
cloudinary.config({
  cloud_name: 'dhniojmt6',
  api_key: '362978357312836',
  api_secret: 'j6o7jAW5bvvZ_LnfP7y95qycI7g'
});

// Test connection
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test with a simple resource list call
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1
    });
    
    console.log('✅ Cloudinary connection successful!');
    console.log('Account details:', {
      cloud_name: 'dhniojmt6',
      resources_found: result.resources.length
    });
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
}

// Test upload capability
async function testCloudinaryUpload() {
  try {
    console.log('Testing Cloudinary upload capability...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==';
    
    const result = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'solutil/test',
      resource_type: 'image',
      public_id: 'connection_test_' + Date.now()
    });
    
    console.log('✅ Cloudinary upload successful!');
    console.log('Upload details:', {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes
    });
    
    // Clean up test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing your Cloudinary configuration...\n');
  
  const connectionTest = await testCloudinaryConnection();
  if (connectionTest) {
    await testCloudinaryUpload();
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('Your images will be stored in: https://res.cloudinary.com/dhniojmt6/');
}

runTests().catch(console.error);