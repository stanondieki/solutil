// Quick script to verify booking exists in database
const mongoose = require('mongoose');
require('dotenv').config();

// Load all models
const User = require('./models/User');
const Booking = require('./models/Booking');
const ProviderService = require('./models/ProviderService');
const Service = require('./models/Service');

const checkBooking = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find the recent booking
    const bookingId = '68e634217c00313dfee03c77';
    const bookingNumber = 'BK1759917089125883';
    
    // Search by ID
    const bookingById = await Booking.findById(bookingId)
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service');
    
    if (bookingById) {
      console.log('🎉 BOOKING FOUND BY ID:');
      console.log('Booking Number:', bookingById.bookingNumber);
      console.log('Client:', bookingById.client?.name);
      console.log('Provider:', bookingById.provider?.name);
      console.log('Service:', bookingById.service?.title);
      console.log('Status:', bookingById.status);
      console.log('Created At:', bookingById.createdAt);
      console.log('Total Amount:', bookingById.pricing?.totalAmount);
    } else {
      console.log('❌ Booking not found by ID');
    }

    // Also search by booking number
    const bookingByNumber = await Booking.findOne({ bookingNumber })
      .populate('client', 'name email')
      .populate('provider', 'name email');
    
    if (bookingByNumber) {
      console.log('\n✅ BOOKING ALSO FOUND BY NUMBER');
      console.log('Database ID:', bookingByNumber._id);
    }

    // Count total bookings for this client
    const clientBookings = await Booking.countDocuments({ 
      client: '68dd8990f47a274d646b4bdd' 
    });
    console.log('\n📊 Total bookings for Stanley:', clientBookings);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
};

checkBooking();