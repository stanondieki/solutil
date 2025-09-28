/**
 * Dual-Write Strategy Implementation
 * 
 * This module provides a seamless way to write to both MongoDB and Firestore
 * during the migration period, ensuring data consistency and zero downtime.
 */

const mongoose = require('mongoose');
const { 
  userService,
  serviceService,
  bookingService,
  reviewService,
  escrowPaymentService,
  providerService
} = require('./services');

class DualWriteStrategy {
  constructor(options = {}) {
    this.options = {
      primaryDatabase: options.primaryDatabase || 'mongodb', // 'mongodb' or 'firestore'
      enableFallback: options.enableFallback !== false,
      syncErrors: options.syncErrors !== false,
      logOperations: options.logOperations || false
    };
    
    this.operationLog = [];
    this.syncErrors = [];
  }

  // Generic dual-write method
  async dualWrite(operation, collectionName, data, mongoModel) {
    const results = {
      mongodb: null,
      firestore: null,
      success: true,
      errors: []
    };

    try {
      if (this.options.primaryDatabase === 'mongodb') {
        // MongoDB first, then Firestore
        results.mongodb = await this.executeMongoOperation(operation, mongoModel, data);
        results.firestore = await this.executeFirestoreOperation(operation, collectionName, data, results.mongodb);
      } else {
        // Firestore first, then MongoDB
        results.firestore = await this.executeFirestoreOperation(operation, collectionName, data);
        results.mongodb = await this.executeMongoOperation(operation, mongoModel, data, results.firestore);
      }

      if (this.options.logOperations) {
        this.logOperation(operation, collectionName, data, results);
      }

      return this.options.primaryDatabase === 'mongodb' ? results.mongodb : results.firestore;

    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      
      if (this.options.syncErrors) {
        this.syncErrors.push({
          operation,
          collectionName,
          data,
          error: error.message,
          timestamp: new Date()
        });
      }

      // If primary database operation failed, throw error
      // If secondary database operation failed, log but continue
      if (this.shouldThrowError(error, operation)) {
        throw error;
      }

      console.warn(`Dual-write warning for ${collectionName}:`, error.message);
      return this.options.primaryDatabase === 'mongodb' ? results.mongodb : results.firestore;
    }
  }

  // User operations
  async createUser(userData) {
    const User = mongoose.model('User');
    return this.dualWrite('create', 'users', userData, User);
  }

  async updateUser(userId, updateData) {
    const User = mongoose.model('User');
    return this.dualWrite('update', 'users', { id: userId, ...updateData }, User);
  }

  async deleteUser(userId) {
    const User = mongoose.model('User');
    return this.dualWrite('delete', 'users', { id: userId }, User);
  }

  // Service operations
  async createService(serviceData) {
    const Service = mongoose.model('Service');
    return this.dualWrite('create', 'services', serviceData, Service);
  }

  async updateService(serviceId, updateData) {
    const Service = mongoose.model('Service');
    return this.dualWrite('update', 'services', { id: serviceId, ...updateData }, Service);
  }

  async deleteService(serviceId) {
    const Service = mongoose.model('Service');
    return this.dualWrite('delete', 'services', { id: serviceId }, Service);
  }

  // Booking operations
  async createBooking(bookingData) {
    const Booking = mongoose.model('Booking');
    return this.dualWrite('create', 'bookings', bookingData, Booking);
  }

  async updateBooking(bookingId, updateData) {
    const Booking = mongoose.model('Booking');
    return this.dualWrite('update', 'bookings', { id: bookingId, ...updateData }, Booking);
  }

  async deleteBooking(bookingId) {
    const Booking = mongoose.model('Booking');
    return this.dualWrite('delete', 'bookings', { id: bookingId }, Booking);
  }

  // Review operations
  async createReview(reviewData) {
    const Review = mongoose.model('Review');
    return this.dualWrite('create', 'reviews', reviewData, Review);
  }

  async updateReview(reviewId, updateData) {
    const Review = mongoose.model('Review');
    return this.dualWrite('update', 'reviews', { id: reviewId, ...updateData }, Review);
  }

  async deleteReview(reviewId) {
    const Review = mongoose.model('Review');
    return this.dualWrite('delete', 'reviews', { id: reviewId }, Review);
  }

  // Escrow payment operations
  async createEscrowPayment(escrowData) {
    const EscrowPayment = mongoose.model('EscrowPayment');
    return this.dualWrite('create', 'escrowPayments', escrowData, EscrowPayment);
  }

  async updateEscrowPayment(escrowId, updateData) {
    const EscrowPayment = mongoose.model('EscrowPayment');
    return this.dualWrite('update', 'escrowPayments', { id: escrowId, ...updateData }, EscrowPayment);
  }

  async deleteEscrowPayment(escrowId) {
    const EscrowPayment = mongoose.model('EscrowPayment');
    return this.dualWrite('delete', 'escrowPayments', { id: escrowId }, EscrowPayment);
  }

  // Execute MongoDB operations
  async executeMongoOperation(operation, Model, data, firestoreResult = null) {
    try {
      switch (operation) {
        case 'create':
          // If Firestore was primary, use its generated ID
          if (firestoreResult && firestoreResult.id) {
            data._id = firestoreResult.id;
          }
          const doc = new Model(data);
          return await doc.save();

        case 'update':
          const updateData = { ...data };
          delete updateData.id;
          return await Model.findByIdAndUpdate(data.id, updateData, { new: true });

        case 'delete':
          return await Model.findByIdAndDelete(data.id);

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error) {
      throw new Error(`MongoDB ${operation} failed: ${error.message}`);
    }
  }

  // Execute Firestore operations
  async executeFirestoreOperation(operation, collectionName, data, mongoResult = null) {
    try {
      const serviceMap = {
        'users': userService,
        'services': serviceService,
        'bookings': bookingService,
        'reviews': reviewService,
        'escrowPayments': escrowPaymentService,
        'providers': providerService
      };

      const service = serviceMap[collectionName];
      if (!service) {
        throw new Error(`No service found for collection: ${collectionName}`);
      }

      switch (operation) {
        case 'create':
          // If MongoDB was primary, use its generated ID
          if (mongoResult && mongoResult._id) {
            data.id = mongoResult._id.toString();
          }
          return await service.create(data);

        case 'update':
          const updateData = { ...data };
          delete updateData.id;
          return await service.updateById(data.id, updateData);

        case 'delete':
          return await service.deleteById(data.id);

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error) {
      throw new Error(`Firestore ${operation} failed: ${error.message}`);
    }
  }

  // Read operations with fallback
  async read(collectionName, id, method = 'findById') {
    const serviceMap = {
      'users': { service: userService, model: 'User' },
      'services': { service: serviceService, model: 'Service' },
      'bookings': { service: bookingService, model: 'Booking' },
      'reviews': { service: reviewService, model: 'Review' },
      'escrowPayments': { service: escrowPaymentService, model: 'EscrowPayment' },
      'providers': { service: providerService, model: 'Provider' }
    };

    const { service, model } = serviceMap[collectionName];
    if (!service) {
      throw new Error(`No service found for collection: ${collectionName}`);
    }

    try {
      if (this.options.primaryDatabase === 'firestore') {
        // Try Firestore first
        const result = await service[method](id);
        if (result) return result;

        // Fallback to MongoDB
        if (this.options.enableFallback) {
          const Model = mongoose.model(model);
          return await Model.findById(id);
        }
      } else {
        // Try MongoDB first
        const Model = mongoose.model(model);
        const result = await Model.findById(id);
        if (result) return result;

        // Fallback to Firestore
        if (this.options.enableFallback) {
          return await service[method](id);
        }
      }

      return null;
    } catch (error) {
      console.warn(`Read operation failed for ${collectionName}:`, error.message);
      
      // Try fallback database
      if (this.options.enableFallback) {
        try {
          if (this.options.primaryDatabase === 'firestore') {
            const Model = mongoose.model(model);
            return await Model.findById(id);
          } else {
            return await service[method](id);
          }
        } catch (fallbackError) {
          console.warn(`Fallback read failed:`, fallbackError.message);
        }
      }

      throw error;
    }
  }

  // Synchronization methods
  async syncDataInconsistencies() {
    console.log('🔄 Starting data inconsistency sync...');
    
    const syncResults = {
      synced: 0,
      errors: 0,
      details: []
    };

    for (const error of this.syncErrors) {
      try {
        await this.retrySyncOperation(error);
        syncResults.synced++;
        syncResults.details.push({
          operation: error.operation,
          collection: error.collectionName,
          status: 'synced'
        });
      } catch (retryError) {
        syncResults.errors++;
        syncResults.details.push({
          operation: error.operation,
          collection: error.collectionName,
          status: 'failed',
          error: retryError.message
        });
      }
    }

    console.log(`✓ Sync completed: ${syncResults.synced} synced, ${syncResults.errors} errors`);
    return syncResults;
  }

  async retrySyncOperation(errorInfo) {
    const { operation, collectionName, data } = errorInfo;
    
    // Retry the operation that failed
    const serviceMap = {
      'users': mongoose.model('User'),
      'services': mongoose.model('Service'),
      'bookings': mongoose.model('Booking'),
      'reviews': mongoose.model('Review'),
      'escrowPayments': mongoose.model('EscrowPayment')
    };

    const model = serviceMap[collectionName];
    if (!model) {
      throw new Error(`No model found for collection: ${collectionName}`);
    }

    // Re-execute the dual write
    return this.dualWrite(operation, collectionName, data, model);
  }

  // Switch primary database
  async switchPrimaryDatabase(newPrimary) {
    if (!['mongodb', 'firestore'].includes(newPrimary)) {
      throw new Error('Primary database must be "mongodb" or "firestore"');
    }

    console.log(`🔄 Switching primary database from ${this.options.primaryDatabase} to ${newPrimary}`);
    
    // Sync any pending inconsistencies before switching
    await this.syncDataInconsistencies();
    
    this.options.primaryDatabase = newPrimary;
    console.log(`✓ Primary database switched to ${newPrimary}`);
  }

  // Utility methods
  shouldThrowError(error, operation) {
    // Define which errors should stop the operation vs just log
    const criticalErrors = ['ValidationError', 'CastError', 'MongoError'];
    return criticalErrors.some(errorType => error.name === errorType);
  }

  logOperation(operation, collectionName, data, results) {
    this.operationLog.push({
      timestamp: new Date(),
      operation,
      collection: collectionName,
      dataId: data.id || data._id,
      success: results.success,
      errors: results.errors
    });

    // Keep log size manageable
    if (this.operationLog.length > 1000) {
      this.operationLog = this.operationLog.slice(-500);
    }
  }

  // Get operation statistics
  getOperationStats() {
    const total = this.operationLog.length;
    const successful = this.operationLog.filter(op => op.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      syncErrors: this.syncErrors.length
    };
  }

  // Clear logs and errors
  clearLogs() {
    this.operationLog = [];
    this.syncErrors = [];
  }
}

// Singleton instance
let dualWriteInstance = null;

const createDualWriteStrategy = (options = {}) => {
  if (!dualWriteInstance) {
    dualWriteInstance = new DualWriteStrategy(options);
  }
  return dualWriteInstance;
};

const getDualWriteStrategy = () => {
  if (!dualWriteInstance) {
    throw new Error('DualWriteStrategy not initialized. Call createDualWriteStrategy first.');
  }
  return dualWriteInstance;
};

module.exports = {
  DualWriteStrategy,
  createDualWriteStrategy,
  getDualWriteStrategy
};