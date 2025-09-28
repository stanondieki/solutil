// Email Integration Test Script
// Run this from the backend directory: node test-email.js

require('dotenv').config();

// Import email functions
const { 
  sendWelcomeEmail, 
  sendBookingConfirmationEmail, 
  sendServiceCreatedEmail,
  sendServiceUpdatedEmail,
  sendBookingStatusUpdateEmail
} = require('./utils/email');

// Test data
const testUser = {
  name: 'John Doe',
  email: 'test@example.com'
};

const testServiceData = {
  providerName: 'Jane Smith',
  serviceTitle: 'Professional Cleaning Service',
  category: 'Cleaning',
  priceDisplay: 'KSh 2,500',
  duration: '2 hours',
  isActive: true,
  serviceURL: 'http://localhost:3000/provider/services'
};

const testBookingData = {
  customerName: 'John Doe',
  bookingNumber: 'BOOK-2024-001',
  serviceName: 'Professional Cleaning Service',
  providerName: 'Jane Smith Cleaning Co.',
  scheduledDate: '2024-01-15',
  scheduledTime: '10:00 - 12:00',
  totalAmount: 2500,
  location: '123 Main Street, Nairobi',
  bookingURL: 'http://localhost:3000/bookings/123'
};

async function testEmailIntegration() {
  console.log('🚀 Starting Email Integration Test...\n');

  // Check if SMTP configuration is available (checking your existing EMAIL_* variables)
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  
  if (!emailHost || !emailUser || !emailPass) {
    console.log('⚠️  SMTP configuration not found in environment variables');
    console.log('Please ensure your .env file has the following:');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    console.log('EMAIL_FROM=your-email@gmail.com');
    console.log('EMAIL_FROM_NAME=SolUtil Service');
    console.log('\n📋 Test cannot proceed without SMTP configuration.');
    return;
  }

  console.log('📧 SMTP Configuration Found:');
  console.log(`   Host: ${emailHost}`);
  console.log(`   Port: ${process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'}`);
  console.log(`   User: ${emailUser}`);
  console.log(`   From: ${process.env.EMAIL_FROM || emailUser}`);
  console.log(`   Name: ${process.env.EMAIL_FROM_NAME || 'SolUtil Service'}\n`);

  try {
    // Test Welcome Email
    console.log('📧 Testing Welcome Email...');
    await sendWelcomeEmail(testUser.email, testUser.name, 'http://localhost:3000/auth/verify-email/test-token');
    console.log('✅ Welcome email sent successfully');

    // Test Service Creation Email
    console.log('\n📧 Testing Service Creation Email...');
    await sendServiceCreatedEmail(testUser.email, testServiceData);
    console.log('✅ Service creation email sent successfully');

    // Test Service Update Email
    console.log('\n📧 Testing Service Update Email...');
    await sendServiceUpdatedEmail(testUser.email, testServiceData);
    console.log('✅ Service update email sent successfully');

    // Test Booking Confirmation Email
    console.log('\n📧 Testing Booking Confirmation Email...');
    await sendBookingConfirmationEmail(testUser.email, testBookingData);
    console.log('✅ Booking confirmation email sent successfully');

    // Test Booking Status Update Email
    console.log('\n📧 Testing Booking Status Update Email...');
    await sendBookingStatusUpdateEmail(testUser.email, {
      ...testBookingData,
      status: 'Confirmed',
      notes: 'Your booking has been confirmed by the provider.'
    });
    console.log('✅ Booking status update email sent successfully');

    console.log('\n🎉 All email tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Welcome Email');
    console.log('✅ Service Creation Email');
    console.log('✅ Service Update Email');
    console.log('✅ Booking Confirmation Email');
    console.log('✅ Booking Status Update Email');

  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Suggestion: Check your SMTP credentials in the .env file');
      console.log('For Gmail, make sure to:');
      console.log('1. Enable 2-Factor Authentication');
      console.log('2. Generate an App Password');
      console.log('3. Use the App Password (not your regular password)');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestion: Check your SMTP host and port settings');
    }
  }
}

// Run the test
testEmailIntegration();