// Quick test endpoint to check provider status
const express = require('express');
const User = require('./models/User');
const { protect } = require('./middleware/auth');

module.exports = async (req, res) => {
  try {
    // Find all providers
    const providers = await User.find({ userType: 'provider' })
      .select('name email providerStatus approvedAt createdAt')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: providers.length,
      data: providers.map(p => ({
        name: p.name,
        email: p.email,
        providerStatus: p.providerStatus,
        approvedAt: p.approvedAt,
        created: p.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};