#!/usr/bin/env node

/**
 * MANUAL SERVICE CREATOR - For Individual Providers
 * 
 * This script allows you to manually create services for specific providers
 * Usage: node create-provider-service.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ProviderService = require('../models/ProviderService');

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/solutilconnect_db?retryWrites=true&w=majority&appName=solutilconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createServiceForProvider = async (providerEmail, serviceData) => {
  try {
    // Find the provider
    const provider = await User.findOne({
      email: providerEmail,
      userType: 'provider'
    });

    if (!provider) {
      throw new Error(`Provider with email ${providerEmail} not found`);
    }

    console.log(`👤 Found provider: ${provider.name} (${provider.email})`);
    console.log(`📊 Status: ${provider.providerStatus}`);

    // Check if service already exists
    const existingService = await ProviderService.findOne({
      providerId: provider._id,
      title: serviceData.title
    });

    if (existingService) {
      console.log(`⚠️  Service "${serviceData.title}" already exists for this provider`);
      return existingService;
    }

    // Create the service
    const providerService = await ProviderService.create({
      providerId: provider._id,
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      price: serviceData.price,
      priceType: serviceData.priceType || 'fixed',
      duration: serviceData.duration || 60,
      images: serviceData.images || [],
      serviceArea: serviceData.serviceArea || ['Nairobi'],
      availableHours: {
        start: '08:00',
        end: '18:00'
      },
      isActive: true,
      rating: 0,
      reviewCount: 0
    });

    console.log(`✅ Created service: "${serviceData.title}" for ${provider.name}`);
    return providerService;

  } catch (error) {
    console.error(`❌ Error creating service:`, error.message);
    throw error;
  }
};

const runServiceCreation = async () => {
  await connectDB();

  console.log('\n🚀 MANUAL SERVICE CREATION');
  console.log('==========================');

  // Example: Create services for specific providers
  const servicesToCreate = [
    {
      providerEmail: 'essiemessy517@gmail.com', // Esther who has no services
      serviceData: {
        title: 'House Cleaning',
        description: 'Professional house cleaning services by Esther',
        category: 'cleaning',
        price: 1800,
        priceType: 'fixed',
        duration: 120,
        serviceArea: ['Nairobi']
      }
    },
    // Add more services here as needed
    {
      providerEmail: 'ondiekistanley21@gmail.com', // Stanley (if you want to create services for suspended providers)
      serviceData: {
        title: 'Electrical Services',
        description: 'Professional electrical installations and repairs by Stanley',
        category: 'electrical',
        price: 2000,
        priceType: 'hourly',
        duration: 60,
        serviceArea: ['Nairobi']
      }
    }
  ];

  for (const { providerEmail, serviceData } of servicesToCreate) {
    try {
      await createServiceForProvider(providerEmail, serviceData);
    } catch (error) {
      console.error(`Failed to create service for ${providerEmail}:`, error.message);
    }
  }

  console.log('\n📊 FINAL STATUS:');
  const totalServices = await ProviderService.countDocuments({ isActive: true });
  console.log(`Total active services: ${totalServices}`);

  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runServiceCreation();
}

module.exports = { createServiceForProvider };