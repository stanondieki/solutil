// Firebase services index - centralized export of all Firestore services
// This replaces the need for direct Mongoose model imports

const userService = require('./userService');
const serviceService = require('./serviceService');
const bookingService = require('./bookingService');
const reviewService = require('./reviewService');
const escrowPaymentService = require('./escrowPaymentService');
const providerService = require('./providerService');

module.exports = {
  // User management
  userService,
  
  // Service management
  serviceService,
  
  // Booking management
  bookingService,
  
  // Review management
  reviewService,
  
  // Payment management
  escrowPaymentService,
  
  // Provider management
  providerService,

  // Convenience exports for backward compatibility
  User: userService,
  Service: serviceService,
  Booking: bookingService,
  Review: reviewService,
  EscrowPayment: escrowPaymentService,
  Provider: providerService
};

// Helper function to initialize all services
const initializeServices = async () => {
  try {
    console.log('Firebase services initialized successfully');
    return {
      userService,
      serviceService,
      bookingService,
      reviewService,
      escrowPaymentService,
      providerService
    };
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    throw error;
  }
};

module.exports.initializeServices = initializeServices;