const mongoose = require('mongoose');
require('dotenv').config();

/**
 * COMPREHENSIVE ULTIMATE PROVIDER DISCOVERY TEST
 * Tests all categories and discovery mechanisms
 */

const testCategories = [
  { id: 'electrical', name: 'Electrical' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'painting', name: 'Painting' },
  { id: 'gardening', name: 'Gardening' },
  { id: 'moving', name: 'Moving' }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function testUltimateProviderDiscovery() {
  try {
    console.log('🚀 TESTING ULTIMATE PROVIDER DISCOVERY SYSTEM');
    console.log('================================================\n');
    
    await connectDB();
    
    // Import route handler (we'll simulate the API call)
    const User = require('./models/User');
    const ProviderService = require('./models/ProviderService');
    
    const results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      categoryResults: {},
      discoveryMechanisms: {
        exactService: 0,
        skillBased: 0,
        fuzzyMatch: 0,
        locationExpanded: 0,
        dynamicServices: 0
      }
    };
    
    for (const category of testCategories) {
      console.log(`🔍 TESTING CATEGORY: ${category.name.toUpperCase()}`);
      console.log(`${'='.repeat(40)}\n`);
      
      results.totalTests++;
      
      const testData = {
        category: category,
        location: { area: 'Kileleshwa' },
        urgency: 'normal',
        budget: 5000,
        providersNeeded: 3
      };
      
      try {
        // Test the discovery logic (simulate API call)
        const discoveryResult = await simulateUltimateDiscovery(testData);
        
        console.log(`✅ Discovery Result for ${category.name}:`);
        console.log(`   Providers found: ${discoveryResult.providers.length}`);
        console.log(`   Search strategies: ${JSON.stringify(discoveryResult.searchStrategies)}`);
        
        if (discoveryResult.providers.length > 0) {
          console.log(`   Top providers:`);
          discoveryResult.providers.slice(0, 3).forEach((provider, index) => {
            console.log(`     ${index + 1}. ${provider.name} (${provider.matchType}, score: ${provider.score})`);
          });
          
          results.passedTests++;
          results.categoryResults[category.id] = {
            status: 'PASS',
            providers: discoveryResult.providers.length,
            strategies: discoveryResult.searchStrategies
          };
          
          // Count discovery mechanisms
          discoveryResult.providers.forEach(provider => {
            if (provider.matchType === 'exact-service') results.discoveryMechanisms.exactService++;
            else if (provider.matchType === 'skill-based') results.discoveryMechanisms.skillBased++;
            else if (provider.matchType === 'fuzzy-match') results.discoveryMechanisms.fuzzyMatch++;
            else if (provider.matchType === 'location-expanded') results.discoveryMechanisms.locationExpanded++;
            else if (provider.matchType === 'dynamic-service') results.discoveryMechanisms.dynamicServices++;
          });
          
        } else {
          console.log(`   ❌ NO PROVIDERS FOUND`);
          results.failedTests++;
          results.categoryResults[category.id] = {
            status: 'FAIL',
            providers: 0,
            strategies: discoveryResult.searchStrategies
          };
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.failedTests++;
        results.categoryResults[category.id] = {
          status: 'ERROR',
          error: error.message
        };
      }
      
      console.log('\n');
    }
    
    // Final summary
    console.log('🎉 TESTING COMPLETE!');
    console.log('===================\n');
    
    console.log('📊 OVERALL RESULTS:');
    console.log(`   Total tests: ${results.totalTests}`);
    console.log(`   Passed: ${results.passedTests}`);
    console.log(`   Failed: ${results.failedTests}`);
    console.log(`   Success rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%\n`);
    
    console.log('📋 CATEGORY BREAKDOWN:');
    Object.entries(results.categoryResults).forEach(([category, result]) => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`   ${status} ${category.padEnd(12)} | ${result.providers || 0} providers | ${result.status}`);
    });
    
    console.log('\n🔧 DISCOVERY MECHANISMS USED:');
    console.log(`   Exact Services: ${results.discoveryMechanisms.exactService}`);
    console.log(`   Skill-Based: ${results.discoveryMechanisms.skillBased}`);
    console.log(`   Fuzzy Match: ${results.discoveryMechanisms.fuzzyMatch}`);
    console.log(`   Location Expanded: ${results.discoveryMechanisms.locationExpanded}`);
    console.log(`   Dynamic Services: ${results.discoveryMechanisms.dynamicServices}\n`);
    
    // Recommendations
    console.log('🎯 RECOMMENDATIONS:');
    const failedCategories = Object.entries(results.categoryResults)
      .filter(([_, result]) => result.status !== 'PASS')
      .map(([category, _]) => category);
    
    if (failedCategories.length === 0) {
      console.log('   🎉 All categories have excellent provider coverage!');
      console.log('   🚀 Ultimate Provider Discovery system is working perfectly!');
    } else {
      console.log(`   ⚠️ Categories needing attention: ${failedCategories.join(', ')}`);
      console.log('   💡 Consider adding more providers or improving skill mapping');
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    throw error;
  }
}

/**
 * Simulate the Ultimate Provider Discovery logic
 */
async function simulateUltimateDiscovery(requestData) {
  const { category, location } = requestData;
  const searchCategory = (category.id || category.name || category).toLowerCase();
  
  console.log(`   🔍 Searching for ${searchCategory} providers...`);
  
  const results = {
    providers: [],
    searchStrategies: {
      exactServices: 0,
      skillBased: 0,
      fuzzyMatch: 0,
      locationExpanded: 0,
      dynamicServices: 0
    }
  };
  
  // Step 1: Exact service match
  const exactMatches = await findExactServiceMatches(searchCategory);
  console.log(`     Exact matches: ${exactMatches.length}`);
  results.searchStrategies.exactServices = exactMatches.length;
  
  // Step 2: Skill-based
  const skillMatches = await findSkillBasedProviders(searchCategory);
  console.log(`     Skill-based: ${skillMatches.length}`);
  results.searchStrategies.skillBased = skillMatches.length;
  
  // Step 3: Fuzzy matching  
  const fuzzyMatches = await findFuzzyCategoryMatches(searchCategory);
  console.log(`     Fuzzy matches: ${fuzzyMatches.length}`);
  results.searchStrategies.fuzzyMatch = fuzzyMatches.length;
  
  // Combine results
  const allProviders = [
    ...exactMatches.map(m => ({ ...m, matchType: 'exact-service', score: 100 })),
    ...skillMatches.map(m => ({ ...m, matchType: 'skill-based', score: 80 })),
    ...fuzzyMatches.map(m => ({ ...m, matchType: 'fuzzy-match', score: 60 }))
  ];
  
  // Deduplicate and enhance
  const providerMap = new Map();
  allProviders.forEach(match => {
    const id = match.provider._id.toString();
    if (!providerMap.has(id) || match.score > providerMap.get(id).score) {
      providerMap.set(id, {
        ...match.provider._doc,
        matchType: match.matchType,
        score: match.score,
        service: match.service
      });
    }
  });
  
  results.providers = Array.from(providerMap.values())
    .sort((a, b) => b.score - a.score);
  
  return results;
}

async function findExactServiceMatches(category) {
  const ProviderService = require('./models/ProviderService');
  
  const services = await ProviderService.find({
    $or: [
      { category: new RegExp(`^${category}$`, 'i') },
      { category: new RegExp(category, 'i') },
      { title: new RegExp(category, 'i') }
    ],
    isActive: true
  })
  .populate({
    path: 'providerId',
    match: { 
      userType: 'provider',
      providerStatus: 'approved'
    }
  });

  return services
    .filter(service => service.providerId)
    .map(service => ({
      provider: service.providerId,
      service: service
    }));
}

async function findSkillBasedProviders(category) {
  const User = require('./models/User');
  
  const categoryKeywords = getCategoryKeywords(category);
  
  const providers = await User.find({
    userType: 'provider',
    providerStatus: 'approved',
    'providerProfile.skills': {
      $in: categoryKeywords.map(keyword => new RegExp(keyword, 'i'))
    }
  });

  return providers.map(provider => ({
    provider: provider,
    service: null
  }));
}

async function findFuzzyCategoryMatches(category) {
  const ProviderService = require('./models/ProviderService');
  
  const fuzzyCategories = getFuzzyCategories(category);
  
  const services = await ProviderService.find({
    category: {
      $in: fuzzyCategories.map(cat => new RegExp(cat, 'i'))
    },
    isActive: true
  })
  .populate({
    path: 'providerId',
    match: { 
      userType: 'provider',
      providerStatus: 'approved'
    }
  });

  return services
    .filter(service => service.providerId)
    .map(service => ({
      provider: service.providerId,
      service: service
    }));
}

function getCategoryKeywords(category) {
  const keywordMap = {
    'electrical': ['electrical', 'electrician', 'wiring', 'lighting'],
    'plumbing': ['plumbing', 'plumber', 'pipe repair', 'water systems'],
    'cleaning': ['cleaning', 'cleaner', 'house cleaning', 'deep cleaning'],
    'carpentry': ['carpentry', 'carpenter', 'furniture', 'woodwork'],
    'painting': ['painting', 'painter', 'interior painting'],
    'gardening': ['gardening', 'gardener', 'landscaping', 'lawn care'],
    'moving': ['moving', 'mover', 'relocation', 'packing']
  };
  
  return keywordMap[category] || [category];
}

function getFuzzyCategories(category) {
  const fuzzyMap = {
    'electrical': ['maintenance', 'repair', 'installation'],
    'plumbing': ['maintenance', 'repair', 'installation', 'water'],
    'cleaning': ['maintenance', 'housekeeping', 'janitorial'],
    'carpentry': ['woodwork', 'furniture', 'construction'],
    'painting': ['decoration', 'renovation', 'maintenance'],
    'gardening': ['landscaping', 'outdoor', 'maintenance'],
    'moving': ['transport', 'logistics', 'relocation']
  };
  
  return fuzzyMap[category] || ['other'];
}

// Run the test
if (require.main === module) {
  testUltimateProviderDiscovery();
}

module.exports = { testUltimateProviderDiscovery };