require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

const BACKEND_URL = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

async function testCategoryFilteringFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== TESTING CATEGORY FILTERING FIX ===');
    
    // Login as a client
    console.log('\n1️⃣ LOGGING IN AS CLIENT...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'abuyallan45@gmail.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed, skipping API tests');
      return;
    }
    
    const authToken = loginResponse.data.data.token;
    console.log('✅ Client logged in successfully');
    
    // Test different categories
    const testCategories = [
      { id: 'electrical', name: 'Electrical' },
      { id: 'cleaning', name: 'Cleaning' },
      { id: 'plumbing', name: 'Plumbing' }
    ];
    
    for (const category of testCategories) {
      console.log(`\n2️⃣ TESTING ${category.name.toUpperCase()} SERVICE MATCHING...`);
      
      try {
        const matchingResponse = await axios.post(`${BACKEND_URL}/api/booking/match-providers-v2`, {
          category: category,
          date: '2025-10-18',
          time: '14:00',
          location: { area: 'Nairobi', address: 'Test Address' },
          urgency: 'normal'
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Enhanced API response for ${category.name}:`, matchingResponse.data.success);
        
        if (matchingResponse.data.success && matchingResponse.data.data?.providers) {
          const providers = matchingResponse.data.data.providers;
          console.log(`   Found ${providers.length} ${category.name} providers:`);
          
          providers.forEach((provider, index) => {
            console.log(`      ${index + 1}. ${provider.name} - ${provider.serviceName || 'Service'}`);
            console.log(`         Match Type: ${provider.matchType}`);
            console.log(`         Service Category: ${provider.category || 'N/A'}`);
          });
          
          // Validate that only correct category providers are returned
          const wrongCategoryProviders = providers.filter(p => {
            const serviceName = (p.serviceName || '').toLowerCase();
            const categoryName = category.name.toLowerCase();
            return !serviceName.includes(categoryName) && p.matchType === 'service';
          });
          
          if (wrongCategoryProviders.length === 0) {
            console.log(`   ✅ SUCCESS: Only ${category.name} providers returned`);
          } else {
            console.log(`   ❌ ISSUE: Found wrong category providers:`, wrongCategoryProviders.map(p => p.name));
          }
        } else {
          console.log(`   ⚠️ No providers found for ${category.name}`);
        }
        
      } catch (apiError) {
        console.log(`   ❌ API error for ${category.name}:`, apiError.response?.data?.message || apiError.message);
      }
    }
    
    console.log('\n🎉 CATEGORY FILTERING TEST COMPLETE!');
    console.log('\n📋 EXPECTED RESULTS:');
    console.log('   ✅ Electrical: Should only show Kemmy and Yvette');
    console.log('   ✅ Cleaning: Should only show Esther and Peninah');
    console.log('   ✅ Plumbing: Should only show Yvette');
    console.log('   ✅ No cross-contamination between categories');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testCategoryFilteringFix();