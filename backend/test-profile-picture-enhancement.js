const axios = require('axios');

/**
 * Test Script: Verify Actual Profile Pictures in Provider Matching
 * This script tests if the enhanced provider matching system properly fetches
 * and returns actual profile pictures instead of placeholder images.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testProfilePictureDisplay() {
  console.log('🖼️ Testing Profile Picture Display in Provider Matching...\n');

  try {
    // Test data for provider matching
    const testData = {
      category: 'plumbing',
      date: '2025-10-22',
      time: '14:00',
      location: { area: 'Lavington' },
      providersNeeded: 3,
      urgency: 'normal'
    };

    console.log('📋 Test Parameters:', testData);
    console.log('\n🔍 Testing Smart Provider Matching...');

    // Test Smart Provider Matching
    const smartResponse = await axios.post(`${BACKEND_URL}/api/booking/smart-match-providers`, testData, {
      headers: {
        'Authorization': `Bearer YOUR_TEST_TOKEN`, // Replace with actual token
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Smart Matching Response:');
    console.log(`Found ${smartResponse.data.data.providers.length} providers`);

    // Analyze profile pictures
    smartResponse.data.data.providers.forEach((provider, index) => {
      console.log(`\n👤 Provider ${index + 1}: ${provider.name}`);
      console.log(`   Profile Picture: ${provider.profilePicture}`);
      console.log(`   Picture Type: ${provider.profilePictureType || 'not specified'}`);
      console.log(`   Avatar: ${provider.profile?.avatar || 'not specified'}`);
      console.log(`   Avatar Type: ${provider.profile?.avatarType || 'not specified'}`);

      // Categorize profile picture types
      if (provider.profilePicture) {
        if (provider.profilePicture.includes('ui-avatars.com')) {
          console.log(`   📄 Status: Using generated avatar`);
        } else if (provider.profilePicture.includes('unsplash.com')) {
          console.log(`   🎨 Status: Using category fallback image`);
        } else if (provider.profilePicture.includes('solutilconnect') || provider.profilePicture.includes('localhost')) {
          console.log(`   ✅ Status: Using actual uploaded profile picture`);
        } else {
          console.log(`   🌐 Status: Using external profile picture`);
        }
      } else {
        console.log(`   ❌ Status: No profile picture provided`);
      }
    });

    // Test Enhanced Provider Matching for comparison
    console.log('\n\n🔍 Testing Enhanced Provider Matching...');
    const enhancedResponse = await axios.post(`${BACKEND_URL}/api/booking/match-providers-v2`, testData, {
      headers: {
        'Authorization': `Bearer YOUR_TEST_TOKEN`, // Replace with actual token
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Enhanced Matching Response:');
    console.log(`Found ${enhancedResponse.data.data.providers.length} providers`);

    // Compare profile picture handling
    console.log('\n📊 Profile Picture Comparison:');
    console.log('Smart Matching vs Enhanced Matching');
    console.log('=====================================');

    const smartPics = smartResponse.data.data.providers.map(p => ({
      name: p.name,
      pic: p.profilePicture,
      type: p.profilePictureType
    }));

    const enhancedPics = enhancedResponse.data.data.providers.map(p => ({
      name: p.name,
      pic: p.profilePicture,
      type: p.profilePictureType
    }));

    console.log('\n🧠 Smart Matching Profile Pictures:');
    smartPics.forEach((provider, i) => {
      console.log(`   ${i + 1}. ${provider.name}: ${provider.pic} (${provider.type || 'unknown'})`);
    });

    console.log('\n🔧 Enhanced Matching Profile Pictures:');
    enhancedPics.forEach((provider, i) => {
      console.log(`   ${i + 1}. ${provider.name}: ${provider.pic} (${provider.type || 'unknown'})`);
    });

    // Summary statistics
    const smartActualPics = smartPics.filter(p => 
      p.pic && !p.pic.includes('ui-avatars.com') && !p.pic.includes('unsplash.com')
    ).length;

    const enhancedActualPics = enhancedPics.filter(p => 
      p.pic && !p.pic.includes('ui-avatars.com') && !p.pic.includes('unsplash.com')
    ).length;

    console.log('\n📈 Summary Statistics:');
    console.log(`   Smart Matching - Actual Profile Pictures: ${smartActualPics}/${smartPics.length}`);
    console.log(`   Enhanced Matching - Actual Profile Pictures: ${enhancedActualPics}/${enhancedPics.length}`);

    const smartPercentage = Math.round((smartActualPics / smartPics.length) * 100);
    const enhancedPercentage = Math.round((enhancedActualPics / enhancedPics.length) * 100);

    console.log(`   Smart Matching - Success Rate: ${smartPercentage}%`);
    console.log(`   Enhanced Matching - Success Rate: ${enhancedPercentage}%`);

    if (smartActualPics > 0 || enhancedActualPics > 0) {
      console.log('\n🎉 SUCCESS: Profile picture enhancement is working!');
      console.log('   The system is now fetching actual provider profile pictures.');
    } else {
      console.log('\n⚠️ NOTICE: No actual profile pictures found.');
      console.log('   This may be because:');
      console.log('   1. Providers haven\'t uploaded profile pictures yet');
      console.log('   2. The test providers don\'t have profile pictures');
      console.log('   3. The profile picture paths need to be verified');
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication Note:');
      console.log('   Please replace YOUR_TEST_TOKEN with a valid authentication token');
      console.log('   or remove the Authorization header for testing without auth');
    }
  }
}

// Test profile picture URL validation
function testProfilePictureUrls() {
  console.log('\n🔗 Testing Profile Picture URL Formats...\n');

  const testUrls = [
    '/uploads/profiles/provider123.jpg',
    'uploads/profiles/provider123.jpg',
    'https://example.com/profile.jpg',
    '/api/uploads/provider-avatar.png'
  ];

  const BACKEND_URL = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

  testUrls.forEach((url, index) => {
    console.log(`Test ${index + 1}: ${url}`);
    
    if (url.startsWith('http')) {
      console.log(`   ✅ Absolute URL: ${url}`);
    } else {
      const fullUrl = `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      console.log(`   🔗 Converted to: ${fullUrl}`);
    }
    console.log('');
  });
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Profile Picture Enhancement Tests\n');
  console.log('='.repeat(60));
  
  // Test URL formatting
  testProfilePictureUrls();
  
  console.log('='.repeat(60));
  
  // Test actual provider matching
  await testProfilePictureDisplay();
  
  console.log('\n='.repeat(60));
  console.log('🏁 Profile Picture Enhancement Tests Complete');
}

// Execute tests
runTests().catch(console.error);

module.exports = {
  testProfilePictureDisplay,
  testProfilePictureUrls
};