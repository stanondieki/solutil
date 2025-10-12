require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

async function testAPIEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Test with provider who has bookings: kemmy
    const providerId = '68e4fcf48e248b993e547633';
    
    console.log('\n🔍 Simulating API request for provider:', providerId);

    // Simulate the exact logic from the API route
    const { status, date, limit = 50, page = 1 } = {}; // No query params

    // Get all services owned by this provider from both Service and ProviderService models
    const [services, providerServices] = await Promise.all([
      Service.find({ providerId: providerId }).select('_id'),
      ProviderService.find({ providerId: providerId }).select('_id')
    ]);
    
    // Combine service IDs from both models
    const serviceIds = [
      ...services.map(s => s._id),
      ...providerServices.map(s => s._id)
    ];
    
    // Debug logging for security verification (from the actual route)
    console.log(`🔒 Provider ${providerId} accessing bookings`);
    console.log(`📋 Provider owns ${serviceIds.length} services`);
    
    // Build query - STRICT SECURITY: Only bookings for this provider's services AND provider assignment
    let query = {
      $and: [
        {
          $or: [
            { provider: providerId }, // Direct provider assignment
            { service: { $in: serviceIds } } // Booking uses one of provider's services
          ]
        }
      ]
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      query.$and.push({ status: status });
    }

    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.$and.push({
        scheduledDate: {
          $gte: startDate,
          $lt: endDate
        }
      });
    }

    console.log('\n🔍 Final query:', JSON.stringify(query, null, 2));

    // Execute query with pagination and populate
    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(query)
      .populate('client', 'name email phone')
      .populate('service', 'title category price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`\n📊 Query found ${bookings.length} bookings`);
    
    bookings.forEach(booking => {
      console.log(`  - ${booking.bookingNumber}: ${booking.status} on ${booking.scheduledDate}`);
    });

    // Get total count
    const totalBookings = await Booking.countDocuments(query);
    console.log(`\n📈 Total bookings matching query: ${totalBookings}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAPIEndpoint();