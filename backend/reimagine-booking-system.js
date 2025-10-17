require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderService = require('./models/ProviderService');
const Booking = require('./models/Booking');

async function reimagineBookingSystem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('=== REIMAGINING BOOKING SYSTEM ===');
    
    // Step 1: Identify the problem
    console.log('\n🔍 PROBLEM ANALYSIS:');
    console.log('   The issue is likely in the data structure mismatch between:');
    console.log('   1. What the frontend sends as selectedProvider');
    console.log('   2. What the backend expects to receive');
    console.log('   3. How the backend processes the provider selection');
    
    // Step 2: Check current data structures
    console.log('\n📊 CURRENT DATA STRUCTURES:');
    
    const kemmy = await User.findOne({ name: /kemmy/i });
    const kemmyService = await ProviderService.findOne({ providerId: kemmy._id, category: 'electrical' });
    
    console.log('Database Provider (Kemmy):');
    console.log('   Provider ID:', kemmy._id.toString());
    console.log('   Provider Name:', kemmy.name);
    console.log('   Service ID:', kemmyService._id.toString());
    console.log('   Service Title:', kemmyService.title);
    
    // Step 3: Define the CORRECT data structure that should be used
    console.log('\n✅ CORRECT PROVIDER SELECTION STRUCTURE:');
    const correctProviderStructure = {
      id: kemmy._id.toString(),           // Provider's MongoDB _id as string
      name: kemmy.name,                   // Provider's name
      serviceId: kemmyService._id.toString() // Service's MongoDB _id as string
    };
    console.log('   Frontend should send:', JSON.stringify(correctProviderStructure, null, 2));
    
    // Step 4: Test the booking creation logic directly
    console.log('\n🧪 TESTING BOOKING LOGIC DIRECTLY:');
    
    // Find a client
    const client = await User.findOne({ userType: 'client' });
    console.log('   Using client:', client.name);
    
    // Simulate the enhanced booking controller logic
    console.log('\n   Testing Enhanced Controller Logic:');
    
    const selectedProvider = correctProviderStructure;
    console.log('   selectedProvider received:', JSON.stringify(selectedProvider, null, 2));
    
    let assignedProvider = null;
    let assignedService = null;
    let providerAssignmentMethod = '';
    
    if (selectedProvider?.id && selectedProvider.id !== 'temp') {
      console.log('   ✅ User selected a specific provider:', selectedProvider.name);
      console.log('   ✅ Provider ID:', selectedProvider.id);
      console.log('   ✅ Service ID:', selectedProvider.serviceId);
      
      assignedProvider = selectedProvider.id;
      assignedService = selectedProvider.serviceId;
      providerAssignmentMethod = 'user-selected';
      
      console.log('   ✅ Assignment successful - using selected provider');
    } else {
      console.log('   ❌ No valid provider selected, would auto-assign');
    }
    
    // Step 5: Create a test booking with the correct structure
    console.log('\n📝 CREATING TEST BOOKING WITH CORRECT STRUCTURE:');
    
    const testBooking = await Booking.create({
      bookingNumber: `FIXED${Date.now()}`,
      client: client._id,
      provider: new mongoose.Types.ObjectId(assignedProvider),
      service: new mongoose.Types.ObjectId(assignedService),
      serviceType: 'ProviderService',
      scheduledDate: new Date('2025-10-18'),
      scheduledTime: {
        start: '15:00',
        end: '17:00'
      },
      location: {
        address: 'Fixed Provider Selection Test, Nairobi',
        coordinates: { lat: -1.2921, lng: 36.8219 }
      },
      pricing: {
        basePrice: 3500,
        totalAmount: 3500,
        currency: 'KES'
      },
      payment: {
        method: 'cash',
        status: 'pending'
      },
      notes: {
        client: 'Test booking with fixed provider selection'
      },
      metadata: {
        providerAssignmentMethod,
        urgency: 'normal',
        categoryRequested: 'electrical',
        locationRequested: 'Nairobi',
        createdVia: 'reimagined-booking-system'
      }
    });
    
    await testBooking.populate([
      { path: 'client', select: 'name email' },
      { path: 'provider', select: 'name email' },
      { path: 'service', select: 'title category' }
    ]);
    
    console.log('✅ TEST BOOKING CREATED SUCCESSFULLY!');
    console.log('   Booking Number:', testBooking.bookingNumber);
    console.log('   Client:', testBooking.client.name);
    console.log('   Provider:', testBooking.provider.name);
    console.log('   Service:', testBooking.service.title);
    console.log('   Assignment Method:', testBooking.metadata.providerAssignmentMethod);
    
    // Step 6: Provide solution recommendations
    console.log('\n🛠️ SOLUTION RECOMMENDATIONS:');
    console.log('');
    console.log('1. FRONTEND FIX:');
    console.log('   Ensure selectedProvider object has this exact structure:');
    console.log('   {');
    console.log('     id: provider._id (string),');
    console.log('     name: provider.name,');
    console.log('     serviceId: service._id (string)');
    console.log('   }');
    console.log('');
    console.log('2. BACKEND VALIDATION:');
    console.log('   Add strict validation in booking controllers to ensure:');
    console.log('   - selectedProvider.id is a valid MongoDB ObjectId');
    console.log('   - selectedProvider.serviceId is a valid MongoDB ObjectId');
    console.log('   - The provider and service exist in the database');
    console.log('');
    console.log('3. ERROR HANDLING:');
    console.log('   Add specific error messages when provider selection fails');
    console.log('');
    console.log('4. LOGGING:');
    console.log('   Add detailed logging to track provider selection process');
    
    console.log('\n🎉 REIMAGINED BOOKING SYSTEM ANALYSIS COMPLETE!');

  } catch (error) {
    console.error('❌ Reimagining error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

reimagineBookingSystem();