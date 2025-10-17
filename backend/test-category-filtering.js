require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function testCategoryFiltering() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== TESTING CATEGORY FILTERING ===');
    
    // Step 1: Check what services exist for each category
    console.log('\n1️⃣ ANALYZING SERVICE DISTRIBUTION:');
    
    const categories = ['electrical', 'plumbing', 'cleaning', 'carpentry', 'painting', 'gardening'];
    
    for (const category of categories) {
      const services = await ProviderService.find({ 
        category: new RegExp(category, 'i'),
        isActive: true 
      }).populate('providerId', 'name providerStatus');
      
      const approvedServices = services.filter(s => s.providerId?.providerStatus === 'approved');
      
      console.log(`\n${category.toUpperCase()} Services:`);
      console.log(`   Total: ${services.length}, Approved: ${approvedServices.length}`);
      
      approvedServices.forEach(service => {
        console.log(`   - ${service.title} by ${service.providerId.name}`);
      });
    }
    
    // Step 2: Test the enhanced matching API logic simulation
    console.log('\n2️⃣ TESTING ENHANCED MATCHING LOGIC:');
    
    const testCategory = 'electrical';
    console.log(`\nTesting category: ${testCategory}`);
    
    // Simulate the enhanced API logic
    const providerServices = await ProviderService.find({
      $or: [
        { category: testCategory },
        { category: new RegExp(testCategory, 'i') },
        { title: new RegExp(testCategory, 'i') }
      ],
      isActive: true
    })
    .populate({
      path: 'providerId',
      match: { 
        userType: 'provider',
        providerStatus: 'approved'
      },
      select: 'name email providerStatus'
    });
    
    const validServices = providerServices.filter(service => service.providerId);
    
    console.log(`✅ Enhanced API would return ${validServices.length} electrical services:`);
    validServices.forEach(service => {
      console.log(`   - ${service.title} by ${service.providerId.name} (${service.providerId.providerStatus})`);
    });
    
    // Step 3: Test skill-based fallback
    console.log('\n3️⃣ TESTING SKILL-BASED FALLBACK:');
    
    const skillKeywords = ['electrical', 'wiring', 'lighting', 'electrical repair'];
    
    const skillBasedProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.skills': { 
        $in: skillKeywords.map(keyword => new RegExp(keyword, 'i'))
      }
    }).select('name providerProfile.skills providerStatus');
    
    console.log(`✅ Skill-based fallback would return ${skillBasedProviders.length} providers:`);
    skillBasedProviders.forEach(provider => {
      console.log(`   - ${provider.name}: ${provider.providerProfile?.skills?.join(', ') || 'No skills listed'}`);
    });
    
    // Step 4: Identify cross-category contamination
    console.log('\n4️⃣ CHECKING FOR CROSS-CATEGORY CONTAMINATION:');
    
    const allApprovedProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved'
    }).select('name providerProfile.skills');
    
    console.log('Providers with multiple category skills:');
    allApprovedProviders.forEach(provider => {
      const skills = provider.providerProfile?.skills || [];
      const categoriesFound = [];
      
      categories.forEach(cat => {
        const hasCategory = skills.some(skill => 
          skill.toLowerCase().includes(cat) || 
          cat.includes(skill.toLowerCase())
        );
        if (hasCategory) categoriesFound.push(cat);
      });
      
      if (categoriesFound.length > 1) {
        console.log(`   ⚠️ ${provider.name}: ${categoriesFound.join(', ')} (Skills: ${skills.join(', ')})`);
      }
    });
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('   1. Use enhanced API (/api/booking/match-providers-v2) - filters by actual services');
    console.log('   2. Strict skill matching in fallback - exact category keywords only');
    console.log('   3. Providers should be categorized properly in their services');
    console.log('   4. Skills should be specific to avoid cross-contamination');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testCategoryFiltering();