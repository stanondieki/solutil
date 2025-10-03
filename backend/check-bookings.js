const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const ProviderService = require('./models/ProviderService');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://stano:stano123@cluster0.euu4w.mongodb.net/solutil?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const checkBookings = async () => {
  try {
    await connectDB();

    // Check recent bookings
    const recentBookings = await Booking.find()
      .populate('serviceId', 'title category price')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`\n📋 Recent Bookings (${recentBookings.length}):`);
    console.log('=' .repeat(50));
    
    if (recentBookings.length === 0) {
      console.log('No bookings found. Create some bookings to test the system!');
    } else {
      recentBookings.forEach((booking, index) => {
        console.log(`${index + 1}. Booking ID: ${booking._id}`);
        console.log(`   Service: ${booking.serviceId?.title || 'Unknown'}`);
        console.log(`   Client: ${booking.clientId?.name || 'Unknown'}`);
        console.log(`   Date: ${booking.scheduledDate}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('');
      });
    }

    // Check available services for testing
    const services = await ProviderService.find()
      .populate('providerId', 'name email')
      .limit(5);

    console.log(`\n🔧 Available Services for Testing (${services.length}):`);
    console.log('=' .repeat(50));
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.category})`);
      console.log(`   Provider: ${service.providerId?.name || 'Unknown'}`);
      console.log(`   Price: KES ${service.price} (${service.priceType})`);
      console.log(`   ID: ${service._id}`);
      console.log('');
    });

    console.log('\n🧪 Testing URLs:');
    console.log('Service Discovery: http://localhost:3000/booking/electrical');
    console.log('Service Discovery: http://localhost:3000/booking/plumbing');
    console.log('Service Discovery: http://localhost:3000/booking/cleaning');
    
    if (services.length > 0) {
      console.log(`\nBooking Form: http://localhost:3000/booking/form/${services[0]._id}`);
    }

    mongoose.connection.close();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking bookings:', error);
    process.exit(1);
  }
};

checkBookings();