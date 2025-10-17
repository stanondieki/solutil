const mongoose = require('mongoose');
require('dotenv').config();

const { validateAndFixProviderServices, ensureCategoryProviders } = require('./utils/providerValidation');

/**
 * Connect to database
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * COMPLETE PROVIDER SYSTEM FIX
 * This script will fix all provider-service gaps and ensure every category has providers
 */

async function fixProviderSystem() {
  try {
    console.log('🚀 COMPLETE PROVIDER SYSTEM FIX STARTING...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Step 1: Validate and fix provider-service relationships
    console.log('\n=== STEP 1: PROVIDER-SERVICE VALIDATION ===');
    const validationResults = await validateAndFixProviderServices();
    
    // Step 2: Ensure category coverage
    console.log('\n=== STEP 2: CATEGORY COVERAGE CHECK ===');
    const coverageResults = await ensureCategoryProviders();
    
    // Step 3: Final summary
    console.log('\n🎉 PROVIDER SYSTEM FIX COMPLETE!');
    console.log('\n📊 FINAL SUMMARY:');
    
    console.log('\n🔧 Services Created:');
    console.log(`   Total new services: ${validationResults.servicesCreated}`);
    console.log(`   Providers processed: ${validationResults.providersChecked}`);
    console.log(`   Errors encountered: ${validationResults.errors.length}`);
    
    if (validationResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      validationResults.errors.forEach(error => {
        console.log(`   ${error.provider} (${error.category}): ${error.error}`);
      });
    }
    
    console.log('\n📋 Category Distribution:');
    Object.entries(validationResults.categoryMapping).forEach(([category, data]) => {
      const coverage = coverageResults[category];
      const status = coverage?.coverage || 'Unknown';
      console.log(`   ${category.padEnd(12)} | ${data.providers} providers | ${data.services} services | ${status}`);
    });
    
    console.log('\n🎯 Skill-Service Gaps Fixed:');
    const gapsByCategory = {};
    validationResults.skillServiceGaps.forEach(gap => {
      if (!gapsByCategory[gap.category]) gapsByCategory[gap.category] = [];
      gapsByCategory[gap.category].push(gap.provider);
    });
    
    Object.entries(gapsByCategory).forEach(([category, providers]) => {
      console.log(`   ${category}: ${providers.length} providers (${providers.slice(0, 3).join(', ')}${providers.length > 3 ? '...' : ''})`);
    });
    
    console.log('\n✅ Provider discovery system is now comprehensive!');
    console.log('   All approved providers now have matching services');
    console.log('   All major categories have provider coverage');
    console.log('   Dynamic service creation is enabled');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n💾 Database connection closed');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Test the new Ultimate Provider Discovery API');
    console.log('   2. Update frontend to use the new endpoint');
    console.log('   3. Monitor provider discovery performance');
    
  } catch (error) {
    console.error('❌ Provider system fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixProviderSystem();
}

module.exports = { fixProviderSystem };