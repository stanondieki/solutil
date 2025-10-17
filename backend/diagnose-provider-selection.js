require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');

const BACKEND_URL = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

async function diagnoseProvidrSelectionIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== PROVIDER SELECTION ISSUE DIAGNOSIS ===');
    
    // Step 1: Check how provider data is structured in the database
    console.log('\n1️⃣ CHECKING PROVIDER DATA STRUCTURE...');
    const kemmy = await User.findOne({ name: /kemmy/i });
    const yvette = await User.findOne({ name: /yvette.*mukhungu/i });
    
    console.log('Kemmy provider data:');
    console.log('   ID:', kemmy._id);
    console.log('   Name:', kemmy.name);
    console.log('   Email:', kemmy.email);
    
    console.log('Yvette provider data:');
    console.log('   ID:', yvette._id);
    console.log('   Name:', yvette.name);
    console.log('   Email:', yvette.email);
    
    // Step 2: Check their services
    console.log('\n2️⃣ CHECKING PROVIDER SERVICES...');
    const kemmyServices = await ProviderService.find({ providerId: kemmy._id });
    const yvetteServices = await ProviderService.find({ providerId: yvette._id });
    
    console.log('Kemmy services:');
    kemmyServices.forEach(service => {
      console.log(`   - ${service.title} (ID: ${service._id}, Category: ${service.category})`);
    });
    
    console.log('Yvette services:');
    yvetteServices.forEach(service => {
      console.log(`   - ${service.title} (ID: ${service._id}, Category: ${service.category})`);
    });
    
    // Step 3: Test the provider matching API to see what structure is returned
    console.log('\n3️⃣ TESTING PROVIDER MATCHING API...');
    
    // Login as a client first
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'abuyallan45@gmail.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed, testing with mock data');
      return;
    }
    
    const authToken = loginResponse.data.data.token;
    console.log('✅ Client logged in successfully');
    
    // Test provider matching API
    const matchingResponse = await axios.post(`${BACKEND_URL}/api/booking/match-providers`, {
      category: { id: 'electrical', name: 'Electrical' },
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
    
    console.log('Provider matching API response status:', matchingResponse.data.success);
    const providers = matchingResponse.data.data?.providers || [];
    console.log(`Found ${providers.length} providers through API`);
    
    providers.forEach((provider, index) => {
      console.log(`   ${index + 1}. Provider API structure:`);
      console.log(`      Name: ${provider.name}`);
      console.log(`      ID: ${provider.id || provider._id}`);
      console.log(`      Service ID: ${provider.serviceId}`);
      console.log(`      Service Name: ${provider.serviceName}`);
      console.log(`      All keys:`, Object.keys(provider));
      console.log('');
    });
    
    // Step 4: Test specific provider selection
    console.log('\n4️⃣ TESTING SPECIFIC PROVIDER SELECTION...');
    
    const kemmyFromAPI = providers.find(p => p.name?.toLowerCase().includes('kemmy'));
    if (kemmyFromAPI) {
      console.log('✅ Kemmy found in API response!');
      console.log('   Kemmy API structure:', JSON.stringify(kemmyFromAPI, null, 2));
      
      // Test booking with Kemmy specifically selected
      console.log('\n📝 Testing booking with Kemmy selected...');
      
      const bookingRequest = {
        category: { id: 'electrical', name: 'Electrical' },
        date: '2025-10-18',
        time: '15:00',
        location: { area: 'Nairobi', address: 'Diagnostic test' },
        description: 'Diagnostic test - selecting Kemmy specifically',
        urgency: 'normal',
        providersNeeded: 1,
        paymentTiming: 'pay-after',
        paymentMethod: 'cash',
        selectedProvider: kemmyFromAPI, // Use exact structure from API
        totalAmount: 3500
      };
      
      console.log('Booking request selectedProvider:', JSON.stringify(bookingRequest.selectedProvider, null, 2));
      
      const bookingResponse = await axios.post(`${BACKEND_URL}/api/bookings/simple-v2`, bookingRequest, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (bookingResponse.data.success) {
        const booking = bookingResponse.data.data.booking;
        console.log('✅ Booking created!');
        console.log('   Booking Number:', booking.bookingNumber);
        console.log('   Requested Provider:', kemmyFromAPI.name);
        console.log('   Assigned Provider:', booking.provider?.name);
        
        if (booking.provider?.name?.toLowerCase().includes('kemmy')) {
          console.log('🎉 SUCCESS: Kemmy was correctly assigned!');
        } else {
          console.log('❌ PROBLEM: Different provider assigned!');
          console.log('   Expected:', kemmyFromAPI.name);
          console.log('   Got:', booking.provider?.name);
          
          // Let's check what the backend received
          console.log('\n🔍 DEBUGGING BACKEND LOGS...');
          console.log('   The issue might be in how the backend processes selectedProvider');
          console.log('   Backend expects: { id, name, serviceId }');
          console.log('   Frontend sent:', JSON.stringify(kemmyFromAPI, null, 2));
        }
      } else {
        console.log('❌ Booking failed:', bookingResponse.data.message);
      }
    } else {
      console.log('❌ Kemmy not found in API response');
    }
    
    console.log('\n📋 DIAGNOSIS COMPLETE');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
  }
}

diagnoseProvidrSelectionIssue();