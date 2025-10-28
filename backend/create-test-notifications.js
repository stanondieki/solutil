/**
 * Test script to create sample notifications
 * This will help test the notification system functionality
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://solutilconnect:solutilconnect@cluster0.k1xbg.mongodb.net/solutilconnect?retryWrites=true&w=majority';

// Sample notifications to create
const sampleNotifications = [
  {
    title: 'Booking Confirmed',
    message: 'Your cleaning service booking has been confirmed for tomorrow at 2:00 PM.',
    type: 'booking',
    actionUrl: '/dashboard/bookings',
    actionText: 'View Booking',
    metadata: {
      bookingId: '12345',
      serviceType: 'cleaning'
    }
  },
  {
    title: 'Payment Received',
    message: 'Payment of KES 5,000 has been successfully processed for your plumbing service.',
    type: 'payment',
    actionUrl: '/dashboard/payments',
    actionText: 'View Payment',
    metadata: {
      amount: 5000,
      service: 'plumbing'
    }
  },
  {
    title: 'Service Completed',
    message: 'Your electrical service has been completed. Please rate your experience.',
    type: 'service',
    actionUrl: '/dashboard/reviews',
    actionText: 'Rate Service',
    metadata: {
      serviceType: 'electrical',
      providerId: 'provider123'
    }
  },
  {
    title: 'Special Offer!',
    message: 'Get 30% off your next cleaning package! Limited time offer.',
    type: 'promotion',
    actionUrl: '/services/cleaning',
    actionText: 'View Offers',
    metadata: {
      discount: 30,
      service: 'cleaning'
    }
  },
  {
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM. Some features may be unavailable.',
    type: 'system',
    actionUrl: '/status',
    actionText: 'Check Status',
    metadata: {
      maintenanceType: 'scheduled'
    }
  }
];

async function createTestNotifications() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('✅ Connected to database');

    // Get a test user ID (we'll use the first client user we find)
    const testUser = await db.collection('users').findOne({ 
      userType: 'client'
    });

    if (!testUser) {
      console.log('❌ No client users found. Please create a user account first.');
      return;
    }

    console.log(`👤 Creating notifications for user: ${testUser.name} (${testUser.email})`);

    // Create notifications
    const notifications = sampleNotifications.map(notification => ({
      ...notification,
      userId: testUser._id,
      read: false,
      createdAt: new Date(),
      readAt: null
    }));

    const result = await db.collection('notifications').insertMany(notifications);
    
    console.log(`🔔 Created ${result.insertedCount} test notifications`);
    console.log('✅ Test notifications created successfully!');

    // Display created notifications
    console.log('\n📋 Created notifications:');
    notifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.type})`);
    });

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const shouldCreateAll = args.includes('--all');
const shouldCreateOne = args.includes('--one');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📚 Usage: node create-test-notifications.js [options]

Options:
  --all     Create all sample notifications
  --one     Create one sample notification
  --help    Show this help message

Examples:
  node create-test-notifications.js --all
  node create-test-notifications.js --one
  `);
  process.exit(0);
}

if (shouldCreateAll) {
  createTestNotifications();
} else if (shouldCreateOne) {
  // Create just one notification for quick testing
  createTestNotifications();
} else {
  console.log('📚 Use --help to see usage options');
  console.log('🚀 Quick start: node create-test-notifications.js --all');
}

module.exports = { createTestNotifications };