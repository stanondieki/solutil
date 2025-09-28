// Data migration utilities for MongoDB to Firestore
const mongoose = require('mongoose');
const { db } = require('../config/firebase');
const { collection, doc, setDoc, writeBatch, getDocs } = require('firebase/firestore');

// Import MongoDB models
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const EscrowPayment = require('../models/EscrowPayment');

class DataMigrator {
  constructor() {
    this.batchSize = 500; // Firestore batch limit
  }

  // Convert MongoDB ObjectId to Firestore document ID
  convertObjectId(mongoId) {
    return mongoId.toString();
  }

  // Convert MongoDB document to Firestore format
  convertDocument(mongoDoc, additionalFields = {}) {
    const doc = mongoDoc.toObject();
    
    // Convert _id to id
    if (doc._id) {
      doc.id = this.convertObjectId(doc._id);
      delete doc._id;
    }

    // Convert __v
    delete doc.__v;

    // Convert Date objects to Firestore Timestamps
    Object.keys(doc).forEach(key => {
      if (doc[key] instanceof Date) {
        doc[key] = doc[key];
      }
      // Convert nested ObjectIds to strings
      if (doc[key] && doc[key].toString && doc[key].toString().match(/^[0-9a-fA-F]{24}$/)) {
        doc[key] = this.convertObjectId(doc[key]);
      }
    });

    return { ...doc, ...additionalFields };
  }

  // Migrate Users collection
  async migrateUsers() {
    console.log('🔄 Migrating Users...');
    
    const users = await User.find({});
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const user of users) {
      const userData = this.convertDocument(user, {
        migratedAt: new Date(),
        source: 'mongodb'
      });

      const userRef = doc(db, 'users', userData.id);
      currentBatch.set(userRef, userData);
      operationCount++;

      if (operationCount === this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Execute all batches
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Users batch ${i + 1}/${batches.length} completed`);
    }

    console.log(`✅ Migrated ${users.length} users`);
  }

  // Migrate Services collection
  async migrateServices() {
    console.log('🔄 Migrating Services...');
    
    const services = await Service.find({}).populate('provider');
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const service of services) {
      const serviceData = this.convertDocument(service, {
        migratedAt: new Date(),
        source: 'mongodb'
      });

      const serviceRef = doc(db, 'services', serviceData.id);
      currentBatch.set(serviceRef, serviceData);
      operationCount++;

      if (operationCount === this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Services batch ${i + 1}/${batches.length} completed`);
    }

    console.log(`✅ Migrated ${services.length} services`);
  }

  // Migrate Bookings collection
  async migrateBookings() {
    console.log('🔄 Migrating Bookings...');
    
    const bookings = await Booking.find({}).populate('client provider service');
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const booking of bookings) {
      const bookingData = this.convertDocument(booking, {
        migratedAt: new Date(),
        source: 'mongodb'
      });

      const bookingRef = doc(db, 'bookings', bookingData.id);
      currentBatch.set(bookingRef, bookingData);
      operationCount++;

      if (operationCount === this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Bookings batch ${i + 1}/${batches.length} completed`);
    }

    console.log(`✅ Migrated ${bookings.length} bookings`);
  }

  // Migrate Providers collection
  async migrateProviders() {
    console.log('🔄 Migrating Providers...');
    
    const providers = await Provider.find({}).populate('user');
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const provider of providers) {
      const providerData = this.convertDocument(provider, {
        migratedAt: new Date(),
        source: 'mongodb'
      });

      const providerRef = doc(db, 'providers', providerData.id);
      currentBatch.set(providerRef, providerData);
      operationCount++;

      if (operationCount === this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Providers batch ${i + 1}/${batches.length} completed`);
    }

    console.log(`✅ Migrated ${providers.length} providers`);
  }

  // Migrate Reviews collection
  async migrateReviews() {
    console.log('🔄 Migrating Reviews...');
    
    const reviews = await Review.find({}).populate('client provider service');
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const review of reviews) {
      const reviewData = this.convertDocument(review, {
        migratedAt: new Date(),
        source: 'mongodb'
      });

      const reviewRef = doc(db, 'reviews', reviewData.id);
      currentBatch.set(reviewRef, reviewData);
      operationCount++;

      if (operationCount === this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Reviews batch ${i + 1}/${batches.length} completed`);
    }

    console.log(`✅ Migrated ${reviews.length} reviews`);
  }

  // Migrate EscrowPayments collection
  async migrateEscrowPayments() {
    console.log('🔄 Migrating EscrowPayments...');
    
    const payments = await EscrowPayment.find({}).populate('booking client provider');
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const payment of payments) {
      const paymentData = this.convertDocument(payment, {
        migratedAt: new Date(),
        source: 'mongodb'
      });

      const paymentRef = doc(db, 'escrowPayments', paymentData.id);
      currentBatch.set(paymentRef, paymentData);
      operationCount++;

      if (operationCount === this.batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ EscrowPayments batch ${i + 1}/${batches.length} completed`);
    }

    console.log(`✅ Migrated ${payments.length} escrow payments`);
  }

  // Run complete migration
  async migrateAll() {
    console.log('🚀 Starting complete migration from MongoDB to Firestore...');
    
    try {
      // Migrate in order to handle dependencies
      await this.migrateUsers();
      await this.migrateProviders();
      await this.migrateServices();
      await this.migrateBookings();
      await this.migrateReviews();
      await this.migrateEscrowPayments();
      
      console.log('🎉 Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Verify migration
  async verifyMigration() {
    console.log('🔍 Verifying migration...');
    
    const collections = ['users', 'services', 'bookings', 'providers', 'reviews', 'escrowPayments'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
    }
  }
}

module.exports = DataMigrator;