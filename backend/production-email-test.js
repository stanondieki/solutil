// Production email test - Add this endpoint to your API
const express = require('express');
const { sendWelcomeEmail } = require('../utils/email');

// Add this route to your auth routes for testing
// POST /api/auth/test-email
const testProductionEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }
    
    console.log('🧪 Testing production email to:', email);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      USE_REAL_SMTP: process.env.USE_REAL_SMTP,
      CLIENT_URL: process.env.CLIENT_URL,
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
    
    const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/test-token-${Date.now()}`;
    
    await sendWelcomeEmail(email, 'Production Test User', verificationURL);
    
    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully! Check your inbox and spam folder.',
      data: {
        email,
        verificationURL,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Production email test failed:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message,
      details: {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

// To use this:
// 1. Add to your auth routes: router.post('/test-email', testProductionEmail);
// 2. Call: POST https://your-production-api.com/api/auth/test-email
// 3. Body: { "email": "your-email@gmail.com" }

module.exports = { testProductionEmail };