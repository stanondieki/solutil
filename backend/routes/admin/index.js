const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const { auth } = require('../../middleware/auth');

const router = express.Router();

// Admin middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
    
    // Check if user is admin (you can modify this logic)
    if (decoded.email !== 'admin@solutil.com' && !decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo admin credentials
    if (email === 'admin@solutil.com' && password === 'admin123') {
      const token = jwt.sign(
        { 
          id: 'admin',
          email: 'admin@solutil.com',
          isAdmin: true,
          name: 'Admin User'
        },
        process.env.JWT_SECRET || 'admin_secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: 'admin',
          email: 'admin@solutil.com',
          name: 'Admin User',
          role: 'admin'
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd query your database
    // For demo, returning mock data
    const stats = {
      totalUsers: 1248,
      totalProviders: 156,
      totalBookings: 523,
      totalRevenue: 125430,
      pendingApprovals: 12,
      activeServices: 8
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd query your database
    const users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254712345678',
        role: 'customer',
        status: 'active',
        joinDate: '2024-01-15',
        totalBookings: 12
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+254723456789',
        role: 'provider',
        status: 'active',
        joinDate: '2024-02-10',
        totalBookings: 45
      }
    ];

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // In a real app, you'd update the database
    res.json({ message: 'User status updated successfully', id, status });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all providers
router.get('/providers', adminAuth, async (req, res) => {
  try {
    // Mock data for demo
    const providers = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+254712345678',
        services: ['Plumbing', 'Electrical'],
        rating: 4.8,
        totalJobs: 45,
        status: 'approved',
        joinDate: '2024-01-15',
        location: 'Nairobi, Kenya',
        experience: '5 years',
        verification: {
          idVerified: true,
          phoneVerified: true,
          emailVerified: true
        }
      }
    ];

    res.json({ providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update provider status
router.put('/providers/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // In a real app, you'd update the database
    res.json({ message: 'Provider status updated successfully', id, status });
  } catch (error) {
    console.error('Update provider status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    // Mock data for demo
    const bookings = [
      {
        id: '1',
        customer: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+254712345678'
        },
        provider: {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+254723456789'
        },
        service: 'Plumbing',
        description: 'Fix kitchen sink leak',
        scheduledDate: '2024-09-20T10:00:00Z',
        status: 'confirmed',
        amount: 2500,
        location: 'Nairobi, Kenya',
        createdAt: '2024-09-15T08:00:00Z',
        paymentStatus: 'paid'
      }
    ];

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/bookings/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // In a real app, you'd update the database
    res.json({ message: 'Booking status updated successfully', id, status });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
