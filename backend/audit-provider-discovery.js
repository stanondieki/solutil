require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

async function auditProviderDiscovery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== COMPREHENSIVE PROVIDER DISCOVERY AUDIT ===');
    
    // Step 1: Analyze provider distribution
    console.log('\n1️⃣ PROVIDER DISTRIBUTION ANALYSIS:');
    
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    const approvedProviders = await User.countDocuments({ userType: 'provider', providerStatus: 'approved' });
    const pendingProviders = await User.countDocuments({ userType: 'provider', providerStatus: 'pending' });
    const suspendedProviders = await User.countDocuments({ userType: 'provider', providerStatus: 'suspended' });
    
    console.log(`   Total Providers: ${totalProviders}`);
    console.log(`   Approved: ${approvedProviders}`);
    console.log(`   Pending: ${pendingProviders}`);
    console.log(`   Suspended: ${suspendedProviders}`);
    
    // Step 2: Analyze service distribution
    console.log('\n2️⃣ SERVICE DISTRIBUTION ANALYSIS:');
    
    const totalServices = await ProviderService.countDocuments();
    const activeServices = await ProviderService.countDocuments({ isActive: true });
    
    console.log(`   Total Services: ${totalServices}`);
    console.log(`   Active Services: ${activeServices}`);
    
    // Step 3: Category breakdown
    console.log('\n3️⃣ CATEGORY BREAKDOWN:');
    
    const categories = ['electrical', 'plumbing', 'cleaning', 'carpentry', 'painting', 'gardening', 'moving', 'other'];
    
    for (const category of categories) {
      const categoryServices = await ProviderService.find({
        category: new RegExp(category, 'i'),
        isActive: true
      }).populate({
        path: 'providerId',
        match: { userType: 'provider', providerStatus: 'approved' },
        select: 'name providerStatus'
      });
      
      const validServices = categoryServices.filter(s => s.providerId);
      const providerNames = validServices.map(s => s.providerId.name);
      
      console.log(`\n   ${category.toUpperCase()}:`);
      console.log(`     Services: ${validServices.length}`);
      console.log(`     Providers: ${[...new Set(providerNames)].join(', ') || 'None'}`);
      
      if (validServices.length > 0) {
        validServices.forEach(service => {
          console.log(`       - ${service.title} by ${service.providerId.name}`);
        });
      }
    }
    
    // Step 4: Skill-based provider analysis
    console.log('\n4️⃣ SKILL-BASED PROVIDER ANALYSIS:');
    
    const providersWithSkills = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.skills': { $exists: true, $ne: [] }
    }).select('name providerProfile.skills');
    
    console.log(`   Providers with skills: ${providersWithSkills.length}`);
    
    const skillDistribution = {};
    providersWithSkills.forEach(provider => {
      const skills = provider.providerProfile?.skills || [];
      skills.forEach(skill => {
        const normalizedSkill = skill.toLowerCase();
        if (!skillDistribution[normalizedSkill]) {
          skillDistribution[normalizedSkill] = [];
        }
        skillDistribution[normalizedSkill].push(provider.name);
      });
    });
    
    Object.keys(skillDistribution).forEach(skill => {
      console.log(`     ${skill}: ${skillDistribution[skill].length} providers (${skillDistribution[skill].join(', ')})`);
    });
    
    // Step 5: Provider coverage gaps
    console.log('\n5️⃣ PROVIDER COVERAGE GAPS:');
    
    const emptyCategoriesServices = categories.filter(async (category) => {
      const count = await ProviderService.countDocuments({
        category: new RegExp(category, 'i'),
        isActive: true
      });
      return count === 0;
    });
    
    for (const category of categories) {
      const serviceCount = await ProviderService.countDocuments({
        category: new RegExp(category, 'i'),
        isActive: true
      });
      
      if (serviceCount === 0) {
        console.log(`   ❌ ${category}: No services available`);
        
        // Check if providers with these skills exist
        const skillProviders = await User.find({
          userType: 'provider',
          providerStatus: 'approved',
          'providerProfile.skills': new RegExp(category, 'i')
        }).select('name providerProfile.skills');
        
        if (skillProviders.length > 0) {
          console.log(`     💡 But ${skillProviders.length} providers have ${category} skills: ${skillProviders.map(p => p.name).join(', ')}`);
        }
      } else {
        console.log(`   ✅ ${category}: ${serviceCount} services`);
      }
    }
    
    // Step 6: Service areas analysis
    console.log('\n6️⃣ SERVICE AREAS ANALYSIS:');
    
    const providersWithAreas = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.serviceAreas': { $exists: true, $ne: [] }
    }).select('name providerProfile.serviceAreas');
    
    console.log(`   Providers with service areas: ${providersWithAreas.length}`);
    
    const areaDistribution = {};
    providersWithAreas.forEach(provider => {
      const areas = provider.providerProfile?.serviceAreas || [];
      areas.forEach(area => {
        if (!areaDistribution[area]) {
          areaDistribution[area] = [];
        }
        areaDistribution[area].push(provider.name);
      });
    });
    
    Object.keys(areaDistribution).forEach(area => {
      console.log(`     ${area}: ${areaDistribution[area].length} providers`);
    });
    
    // Step 7: Issues and recommendations
    console.log('\n7️⃣ IDENTIFIED ISSUES:');
    
    const issues = [];
    
    if (approvedProviders < 5) {
      issues.push('❌ Very few approved providers overall');
    }
    
    const categoriesWithNoServices = [];
    const categoriesWithFewServices = [];
    
    for (const category of categories) {
      const serviceCount = await ProviderService.countDocuments({
        category: new RegExp(category, 'i'),
        isActive: true
      });
      
      if (serviceCount === 0) {
        categoriesWithNoServices.push(category);
      } else if (serviceCount < 2) {
        categoriesWithFewServices.push(category);
      }
    }
    
    if (categoriesWithNoServices.length > 0) {
      issues.push(`❌ Categories with no services: ${categoriesWithNoServices.join(', ')}`);
    }
    
    if (categoriesWithFewServices.length > 0) {
      issues.push(`⚠️ Categories with few services: ${categoriesWithFewServices.join(', ')}`);
    }
    
    issues.forEach(issue => console.log(`   ${issue}`));
    
    console.log('\n8️⃣ RECOMMENDATIONS:');
    console.log('   1. Create services for providers who have skills but no services');
    console.log('   2. Implement multi-level fallback provider discovery');
    console.log('   3. Build comprehensive provider search that checks multiple data sources');
    console.log('   4. Add geographical fallback for wider coverage');
    console.log('   5. Create dynamic service generation for skill-based providers');

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

auditProviderDiscovery();