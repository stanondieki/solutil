const mongoose = require('mongoose');
require('dotenv').config();

// Service model for seeding initial data
const Service = require('./models/Service');

// Initial services data
const initialServices = [
  {
    name: 'Plumbing Services',
    description: 'Professional plumbing solutions including pipe repairs, installation, and maintenance',
    category: 'plumbing',
    subcategory: 'residential',
    basePrice: 150,
    priceType: 'hourly',
    currency: 'KES',
    duration: {
      estimated: 120, // 2 hours in minutes
      unit: 'hours'
    },
    images: [{
      url: '/images/services/plumbing.jpg',
      alt: 'Professional plumbing service'
    }],
    tags: ['plumbing', 'pipes', 'water', 'repair', 'installation'],
    isActive: true,
    availability: {
      isAvailable: true,
      schedule: 'flexible'
    }
  },
  {
    name: 'Electrical Services', 
    description: 'Expert electrical work including wiring, installations, and troubleshooting',
    category: 'electrical',
    subcategory: 'residential',
    basePrice: 200,
    priceType: 'hourly',
    currency: 'KES',
    duration: {
      estimated: 180, // 3 hours in minutes
      unit: 'hours'
    },
    images: [{
      url: '/images/services/electrical.jpg',
      alt: 'Professional electrical service'
    }],
    tags: ['electrical', 'wiring', 'installation', 'repair', 'safety'],
    isActive: true,
    availability: {
      isAvailable: true,
      schedule: 'flexible'
    }
  },
  {
    name: 'Cleaning Services',
    description: 'Comprehensive cleaning solutions for homes and offices',
    category: 'cleaning',
    subcategory: 'deep-cleaning',
    basePrice: 80,
    priceType: 'fixed',
    currency: 'KES',
    duration: {
      estimated: 240, // 4 hours in minutes
      unit: 'hours'
    },
    images: [{
      url: '/images/services/cleaning.jpg',
      alt: 'Professional cleaning service'
    }],
    tags: ['cleaning', 'housekeeping', 'deep clean', 'maintenance'],
    isActive: true,
    availability: {
      isAvailable: true,
      schedule: 'flexible'
    }
  },
  {
    name: 'Carpentry Services',
    description: 'Custom carpentry work including furniture, repairs, and installations',
    category: 'carpentry',
    subcategory: 'furniture',
    basePrice: 180,
    priceType: 'hourly',
    currency: 'KES',
    duration: {
      estimated: 300, // 5 hours in minutes
      unit: 'hours'
    },
    images: [{
      url: '/images/services/carpentry.jpg',
      alt: 'Professional carpentry service'
    }],
    tags: ['carpentry', 'furniture', 'wood', 'custom', 'repair'],
    isActive: true,
    availability: {
      isAvailable: true,
      schedule: 'flexible'
    }
  }
];

async function setupMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Check if database exists and has data
    const existingServices = await Service.countDocuments();
    
    if (existingServices === 0) {
      console.log('📊 Database is empty. Seeding initial data...');
      
      // Insert initial services
      await Service.insertMany(initialServices);
      console.log('✅ Initial services data seeded successfully!');
      
      // Create indexes for better performance
      await Service.createIndexes();
      console.log('✅ Database indexes created successfully!');
    } else {
      console.log(`📊 Database already contains ${existingServices} services`);
    }
    
    // Test the connection by fetching some data
    const serviceCount = await Service.countDocuments();
    const services = await Service.find().select('name category').limit(3);
    
    console.log('\n🎉 MongoDB Setup Complete!');
    console.log('==========================================');
    console.log(`📊 Total Services: ${serviceCount}`);
    console.log('📋 Sample Services:');
    services.forEach(service => {
      console.log(`   • ${service.name} (${service.category})`);
    });
    console.log('==========================================\n');
    
    console.log('🚀 Your backend is ready to use with MongoDB Atlas!');
    console.log('💡 You can now start your server with: npm run dev');
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication Error Solutions:');
      console.log('1. Check your username and password in the connection string');
      console.log('2. Ensure the database user has proper permissions');
      console.log('3. Verify the password doesn\'t contain special characters that need encoding');
    }
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 Network Access Error Solutions:');
      console.log('1. Add your IP address to MongoDB Atlas Network Access');
      console.log('2. Or allow access from anywhere (0.0.0.0/0) for development');
    }
    
    console.log('\n📝 Check your .env file and MongoDB Atlas configuration');
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
    process.exit();
  }
}

// Run the setup
setupMongoDB();
