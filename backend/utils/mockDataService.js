// Mock data service for fallback mode when database is not connected

class MockDataService {
  constructor() {
    this.services = [
      {
        _id: '64a1b2c3d4e5f6789012345a',
        name: 'House Cleaning',
        description: 'Professional house cleaning service for homes and apartments',
        category: 'Cleaning',
        basePrice: 2000,
        isActive: true,
        isPopular: true,
        rating: { average: 4.5, count: 125 },
        duration: { estimated: 2, unit: 'hours' },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        _id: '64a1b2c3d4e5f6789012345b',
        name: 'Plumbing Repair',
        description: 'Expert plumbing services for residential and commercial properties',
        category: 'Maintenance',
        basePrice: 1500,
        isActive: true,
        isPopular: true,
        rating: { average: 4.8, count: 89 },
        duration: { estimated: 1.5, unit: 'hours' },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        _id: '64a1b2c3d4e5f6789012345c',
        name: 'Electrical Installation',
        description: 'Safe and reliable electrical installation and repair services',
        category: 'Maintenance',
        basePrice: 3000,
        isActive: true,
        isPopular: false,
        rating: { average: 4.7, count: 56 },
        duration: { estimated: 3, unit: 'hours' },
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08')
      },
      {
        _id: '64a1b2c3d4e5f6789012345d',
        name: 'Garden Maintenance',
        description: 'Complete garden care including lawn mowing, pruning, and landscaping',
        category: 'Landscaping',
        basePrice: 2500,
        isActive: true,
        isPopular: true,
        rating: { average: 4.3, count: 78 },
        duration: { estimated: 4, unit: 'hours' },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
      },
      {
        _id: '64a1b2c3d4e5f6789012345e',
        name: 'HVAC Service',
        description: 'Heating, ventilation, and air conditioning installation and repair',
        category: 'Maintenance',
        basePrice: 4000,
        isActive: true,
        isPopular: false,
        rating: { average: 4.6, count: 34 },
        duration: { estimated: 2.5, unit: 'hours' },
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
      }
    ];

    this.users = [
      {
        _id: '64a1b2c3d4e5f6789012abc1',
        name: 'John Doe',
        email: 'john@example.com',
        userType: 'client',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        phone: '+254712345678'
      },
      {
        _id: '64a1b2c3d4e5f6789012abc2',
        name: 'Admin User',
        email: 'admin@solutil.com',
        userType: 'admin',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        phone: '+254700000000'
      }
    ];

    this.bookings = [
      {
        _id: '64a1b2c3d4e5f6789012def1',
        client: '64a1b2c3d4e5f6789012abc1',
        service: '64a1b2c3d4e5f6789012345a',
        status: 'confirmed',
        scheduledDate: new Date('2024-09-30T10:00:00Z'),
        totalAmount: 2000,
        createdAt: new Date('2024-09-25')
      }
    ];
  }

  // Service methods
  async findServices(filters = {}, options = {}) {
    let filteredServices = [...this.services];
    
    // Apply filters
    if (filters.isActive !== undefined) {
      filteredServices = filteredServices.filter(s => s.isActive === filters.isActive);
    }
    if (filters.category) {
      filteredServices = filteredServices.filter(s => s.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.basePrice) {
      if (filters.basePrice.$gte) {
        filteredServices = filteredServices.filter(s => s.basePrice >= filters.basePrice.$gte);
      }
      if (filters.basePrice.$lte) {
        filteredServices = filteredServices.filter(s => s.basePrice <= filters.basePrice.$lte);
      }
    }

    // Apply sorting
    if (options.sort) {
      // Simple sorting by popularity and rating
      filteredServices.sort((a, b) => {
        if (b.isPopular !== a.isPopular) return b.isPopular - a.isPopular;
        return b.rating.average - a.rating.average;
      });
    }

    // Apply pagination
    const skip = options.skip || 0;
    const limit = options.limit || filteredServices.length;
    const paginatedServices = filteredServices.slice(skip, skip + limit);

    return {
      services: paginatedServices,
      total: filteredServices.length
    };
  }

  async findServiceById(id) {
    return this.services.find(s => s._id === id) || null;
  }

  async createService(serviceData) {
    const newService = {
      _id: `64a1b2c3d4e5f${Date.now()}`,
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      rating: { average: 0, count: 0 }
    };
    this.services.push(newService);
    return newService;
  }

  // User methods
  async findUserByEmail(email) {
    return this.users.find(u => u.email === email) || null;
  }

  async findUserById(id) {
    console.log('MockDataService: Looking for user ID:', id);
    console.log('Available users:', this.users.map(u => ({ id: u._id, email: u.email, userType: u.userType })));
    const user = this.users.find(u => u._id === id) || null;
    console.log('Found user:', user ? { id: user._id, email: user.email, userType: user.userType } : 'null');
    return user;
  }

  async createUser(userData) {
    const newUser = {
      _id: `64a1b2c3d4e5u${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      isEmailVerified: false
    };
    this.users.push(newUser);
    return newUser;
  }

  // Booking methods
  async findBookings(filters = {}, options = {}) {
    let filteredBookings = [...this.bookings];
    
    if (filters.client) {
      filteredBookings = filteredBookings.filter(b => b.client === filters.client);
    }
    
    return {
      bookings: filteredBookings,
      total: filteredBookings.length
    };
  }

  async createBooking(bookingData) {
    const newBooking = {
      _id: `64a1b2c3d4e5b${Date.now()}`,
      ...bookingData,
      createdAt: new Date(),
      status: 'pending'
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  // Generic method to check if running in fallback mode
  isFallbackMode() {
    return !global.isDbConnected();
  }
}

module.exports = new MockDataService();