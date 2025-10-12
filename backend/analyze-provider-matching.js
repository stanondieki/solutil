require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function analyzeProviderMatchingIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 ANALYZING CURRENT PROVIDER MATCHING SYSTEM\n');

    // 1. Check available providers
    console.log('1️⃣ CHECKING AVAILABLE PROVIDERS:');
    const providers = await User.find({ 
      userType: 'provider',
      providerStatus: 'approved' 
    }).select('name email providerProfile.skills providerProfile.serviceAreas providerProfile.rating');
    
    console.log(`   Found ${providers.length} approved providers`);
    
    providers.forEach((provider, index) => {
      const profile = provider.providerProfile || {};
      console.log(`   ${index + 1}. ${provider.name}`);
      console.log(`      Skills: ${(profile.skills || []).join(', ') || 'None specified'}`);
      console.log(`      Service Areas: ${(profile.serviceAreas || []).join(', ') || 'None specified'}`);
      console.log(`      Rating: ${profile.rating || 'Not rated'}`);
      console.log('');
    });

    // 2. Check ProviderService records
    console.log('\n2️⃣ CHECKING PROVIDER SERVICES:');
    const providerServices = await ProviderService.find({ isActive: true })
      .populate('providerId', 'name email')
      .limit(10);
    
    console.log(`   Found ${providerServices.length} active provider services`);
    
    const categoryStats = {};
    providerServices.forEach(service => {
      const category = service.category;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      
      console.log(`   - ${service.title} (${category}) by ${service.providerId?.name || 'Unknown'}`);
    });

    console.log('\n   Category Distribution:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} services`);
    });

    // 3. Test the matching logic
    console.log('\n3️⃣ TESTING MATCHING LOGIC:');
    
    const testCategories = ['cleaning', 'electrical', 'plumbing'];
    const testLocation = 'Kileleshwa';
    
    for (const category of testCategories) {
      console.log(`\n   Testing ${category} matching:`);
      
      // Try the current matching logic
      const categorySkillMap = {
        'plumbing': ['plumbing', 'pipe repair', 'water systems', 'bathroom repair'],
        'electrical': ['electrical', 'wiring', 'lighting', 'electrical repair'],
        'cleaning': ['cleaning', 'house cleaning', 'deep cleaning', 'office cleaning']
      };
      
      const categorySkills = categorySkillMap[category] || [category];
      
      // Match by skills in providerProfile
      const skillMatches = await User.find({
        userType: 'provider',
        providerStatus: 'approved',
        'providerProfile.skills': { 
          $in: categorySkills.map(skill => new RegExp(skill, 'i'))
        }
      }).select('name providerProfile.skills');
      
      console.log(`   Skill-based matches: ${skillMatches.length}`);
      skillMatches.forEach(provider => {
        const matchingSkills = (provider.providerProfile?.skills || []).filter(skill => 
          categorySkills.some(catSkill => 
            skill.toLowerCase().includes(catSkill.toLowerCase())
          )
        );
        console.log(`     - ${provider.name}: ${matchingSkills.join(', ')}`);
      });
      
      // Match by ProviderService category
      const serviceMatches = await ProviderService.find({
        category: category,
        isActive: true
      }).populate('providerId', 'name').limit(5);
      
      console.log(`   Service-based matches: ${serviceMatches.length}`);
      serviceMatches.forEach(service => {
        console.log(`     - ${service.providerId?.name || 'Unknown'}: ${service.title}`);
      });
    }

    // 4. Identify issues
    console.log('\n4️⃣ IDENTIFIED ISSUES:');
    
    const issues = [];
    
    if (providers.length === 0) {
      issues.push('❌ No approved providers found');
    }
    
    const providersWithoutSkills = providers.filter(p => 
      !p.providerProfile?.skills || p.providerProfile.skills.length === 0
    );
    if (providersWithoutSkills.length > 0) {
      issues.push(`❌ ${providersWithoutSkills.length} providers missing skills`);
    }
    
    const providersWithoutAreas = providers.filter(p => 
      !p.providerProfile?.serviceAreas || p.providerProfile.serviceAreas.length === 0
    );
    if (providersWithoutAreas.length > 0) {
      issues.push(`❌ ${providersWithoutAreas.length} providers missing service areas`);
    }
    
    if (Object.keys(categoryStats).length === 0) {
      issues.push('❌ No active ProviderService records found');
    }
    
    if (issues.length === 0) {
      console.log('   ✅ No major issues detected');
    } else {
      issues.forEach(issue => console.log(`   ${issue}`));
    }

    console.log('\n5️⃣ RECOMMENDATIONS:');
    console.log('   ✅ Use ProviderService model as primary matching source');
    console.log('   ✅ Fall back to User.providerProfile.skills as secondary');
    console.log('   ✅ Ensure all providers have complete profiles');
    console.log('   ✅ Implement location-based filtering');
    console.log('   ✅ Add availability checking');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeProviderMatchingIssues();