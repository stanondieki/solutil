const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const { auth } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for service image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/services/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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
          userId: 'admin',
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

// ==================== SERVICE MANAGEMENT ENDPOINTS ====================

// Get all services with admin details
router.get('/services', adminAuth, async (req, res) => {
  try {
    // Check if database is connected
    if (!global.isDbConnected || !global.isDbConnected()) {
      console.log('🔄 Database not connected, serving mock data for services');
      // Mock data for when database is not available
      const mockServices = [
        {
          _id: '1',
          name: 'Plumbing Services',
          description: 'Professional plumbing installation and repair',
          category: 'plumbing',
          basePrice: 2500,
          currency: 'KES',
          isActive: true,
          bookingCount: 45,
          rating: { average: 4.8, count: 23 },
          createdAt: '2025-01-15T10:00:00Z'
        },
        {
          _id: '2',
          name: 'Electrical Installation',
          description: 'Safe and reliable electrical work',
          category: 'electrical',
          basePrice: 3000,
          currency: 'KES',
          isActive: true,
          bookingCount: 32,
          rating: { average: 4.7, count: 18 },
          createdAt: '2025-01-16T10:00:00Z'
        },
        {
          _id: '3',
          name: 'House Cleaning',
          description: 'Deep cleaning for homes and offices',
          category: 'cleaning',
          basePrice: 1500,
          currency: 'KES',
          isActive: true,
          bookingCount: 67,
          rating: { average: 4.9, count: 41 },
          createdAt: '2025-01-17T10:00:00Z'
        },
        {
          _id: '4',
          name: 'Carpentry Work',
          description: 'Custom furniture and woodwork',
          category: 'carpentry',
          basePrice: 4000,
          currency: 'KES',
          isActive: true,
          bookingCount: 28,
          rating: { average: 4.6, count: 15 },
          createdAt: '2025-01-18T10:00:00Z'
        },
        {
          _id: '5',
          name: 'Painting Services',
          description: 'Interior and exterior painting',
          category: 'painting',
          basePrice: 2000,
          currency: 'KES',
          isActive: false,
          bookingCount: 19,
          rating: { average: 4.5, count: 12 },
          createdAt: '2025-01-19T10:00:00Z'
        },
        {
          _id: '6',
          name: 'Garden Maintenance',
          description: 'Landscaping and garden care',
          category: 'gardening',
          basePrice: 1800,
          currency: 'KES',
          isActive: true,
          bookingCount: 22,
          rating: { average: 4.4, count: 9 },
          createdAt: '2025-01-20T10:00:00Z'
        }
      ];

      const mockStats = {
        totalServices: 6,
        activeServices: 5,
        popularServices: 4,
        averagePrice: 2467,
        totalBookings: 213
      };

      return res.json({
        services: mockServices,
        pagination: {
          page: 1,
          pages: 1,
          total: mockServices.length,
          limit: 20
        },
        stats: mockStats
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const services = await Service.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviews', 'rating comment user createdAt');

    const total = await Service.countDocuments(filters);

    // Get service statistics
    const stats = await Service.aggregate([
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
          popularServices: { $sum: { $cond: ['$isPopular', 1, 0] } },
          averagePrice: { $avg: '$basePrice' },
          totalBookings: { $sum: '$bookingCount' }
        }
      }
    ]);

    res.json({
      services,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      stats: stats[0] || {
        totalServices: 0,
        activeServices: 0,
        popularServices: 0,
        averagePrice: 0,
        totalBookings: 0
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service by ID
router.get('/services/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('reviews', 'rating comment user createdAt')
      .populate('providers', 'businessName user rating location');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new service
router.post('/services', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const serviceData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      subcategory: req.body.subcategory,
      basePrice: parseFloat(req.body.basePrice),
      priceType: req.body.priceType || 'fixed',
      currency: req.body.currency || 'KES',
      duration: {
        estimated: parseInt(req.body.estimatedDuration),
        unit: req.body.durationUnit || 'hours'
      },
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      requirements: {
        tools: req.body.tools ? req.body.tools.split(',').map(tool => tool.trim()) : [],
        materials: req.body.materials ? req.body.materials.split(',').map(material => material.trim()) : [],
        skillLevel: req.body.skillLevel || 'intermediate'
      },
      availability: {
        daysOfWeek: req.body.daysOfWeek ? req.body.daysOfWeek.split(',') : [],
        timeSlots: req.body.timeSlots ? JSON.parse(req.body.timeSlots) : []
      },
      metadata: {
        seoTitle: req.body.seoTitle,
        seoDescription: req.body.seoDescription,
        keywords: req.body.keywords ? req.body.keywords.split(',').map(kw => kw.trim()) : []
      },
      isActive: req.body.isActive !== 'false'
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      serviceData.images = req.files.map(file => ({
        url: `/uploads/services/${file.filename}`,
        public_id: file.filename
      }));
    }

    const service = await Service.create(serviceData);

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(400).json({ 
      message: 'Error creating service',
      error: error.message 
    });
  }
});

// Update service
router.put('/services/:id', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      subcategory: req.body.subcategory,
      basePrice: req.body.basePrice ? parseFloat(req.body.basePrice) : service.basePrice,
      priceType: req.body.priceType || service.priceType,
      currency: req.body.currency || service.currency,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : service.tags,
      isActive: req.body.isActive !== undefined ? req.body.isActive !== 'false' : service.isActive
    };

    // Update duration if provided
    if (req.body.estimatedDuration) {
      updateData.duration = {
        estimated: parseInt(req.body.estimatedDuration),
        unit: req.body.durationUnit || service.duration.unit
      };
    }

    // Update requirements if provided
    if (req.body.tools || req.body.materials || req.body.skillLevel) {
      updateData.requirements = {
        tools: req.body.tools ? req.body.tools.split(',').map(tool => tool.trim()) : service.requirements.tools,
        materials: req.body.materials ? req.body.materials.split(',').map(material => material.trim()) : service.requirements.materials,
        skillLevel: req.body.skillLevel || service.requirements.skillLevel
      };
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/services/${file.filename}`,
        public_id: file.filename
      }));
      updateData.images = [...service.images, ...newImages];
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(400).json({ 
      message: 'Error updating service',
      error: error.message 
    });
  }
});

// Delete service
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if service has active bookings
    const activeBookings = await Booking.countDocuments({ 
      service: req.params.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with active bookings. Please complete or cancel all bookings first.' 
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle service active status
router.patch('/services/:id/toggle-active', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service
    });
  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service categories with counts
router.get('/services/stats/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: ['$isActive', 1, 0] } },
          averagePrice: { $avg: '$basePrice' },
          totalBookings: { $sum: '$bookingCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk operations for services
router.post('/services/bulk-action', adminAuth, async (req, res) => {
  try {
    const { serviceIds, action } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: 'Service IDs are required' });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await Service.updateMany(
          { _id: { $in: serviceIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Service.updateMany(
          { _id: { $in: serviceIds } },
          { isActive: false }
        );
        break;
      case 'delete':
        // Check for active bookings first
        const activeBookings = await Booking.countDocuments({
          service: { $in: serviceIds },
          status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (activeBookings > 0) {
          return res.status(400).json({ 
            message: 'Cannot delete services with active bookings' 
          });
        }

        result = await Service.deleteMany({ _id: { $in: serviceIds } });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
