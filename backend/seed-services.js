// === SEED SERVICES ANALYSIS ===
// Understanding how services are seeded

const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

const sampleServices = [
  {
    name: 'Emergency Plumbing Repair',
    description: 'Quick response for burst pipes, leaks, and emergency plumbing issues. Available 24/7.',
    category: 'plumbing',
    subcategory: 'emergency-repair',
    basePrice: 3500,
    priceType: 'fixed',
    currency: 'KES',
    duration: {
      estimated: 120,
      unit: 'minutes'
    },
    images: [
      {
        url: '/images/services/plumbing.jpg',
        public_id: 'plumbing_service_1'
      }
    ],
    tags: ['emergency', 'plumbing', 'repair', 'quick-response'],
    requirements: {
      tools: ['pipe wrench', 'plumbing snake', 'pipe cutter'],
      materials: ['pipes', 'fittings', 'sealant'],
      skillLevel: 'expert'
    },
    availability: {
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timeSlots: [
        { start: '00:00', end: '23:59' }
      ]
    },
    metadata: {
      seoTitle: 'Emergency Plumbing Services Nairobi - 24/7 Response',
      seoDescription: 'Professional emergency plumbing repair services available 24/7 in Nairobi',
      keywords: ['emergency plumbing', 'plumber nairobi', '24/7 plumbing']
    },
    isActive: true
  },
  {
    name: 'House Electrical Installation',
    description: 'Complete electrical wiring and installation for new homes and renovations.',
    category: 'electrical',
    subcategory: 'installation',
    basePrice: 15000,
    priceType: 'fixed',
    currency: 'KES',
    duration: {
      estimated: 8,
      unit: 'hours'
    },
    images: [
      {
        url: '/images/services/electrical.jpg',
        public_id: 'electrical_service_1'
      }
    ],
    tags: ['electrical', 'wiring', 'installation', 'home'],
    requirements: {
      tools: ['wire strippers', 'multimeter', 'drill', 'electrical tester'],
      materials: ['electrical cables', 'switches', 'outlets', 'circuit breakers'],
      skillLevel: 'expert'
    },
    availability: {
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: [
        { start: '08:00', end: '17:00' }
      ]
    },
    metadata: {
      seoTitle: 'Professional Electrical Installation Services Kenya',
      seoDescription: 'Expert electrical wiring and installation services for homes and offices',
      keywords: ['electrical installation', 'wiring', 'electrician kenya']
    },
    isActive: true
  },
  {
    name: 'Deep House Cleaning',
    description: 'Thorough deep cleaning service for homes including all rooms, kitchen, and bathrooms.',
    category: 'cleaning',
    subcategory: 'deep-cleaning',
    basePrice: 4500,
    priceType: 'fixed',
    currency: 'KES',
    duration: {
      estimated: 6,
      unit: 'hours'
    },
    images: [
      {
        url: '/images/services/cleaning.jpg',
        public_id: 'cleaning_service_1'
      }
    ],
    tags: ['cleaning', 'deep-clean', 'home', 'sanitization'],
    requirements: {
      tools: ['vacuum cleaner', 'mops', 'brushes', 'cleaning cloths'],
      materials: ['detergents', 'disinfectants', 'glass cleaner'],
      skillLevel: 'intermediate'
    },
    availability: {
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: [
        { start: '08:00', end: '16:00' }
      ]
    },
    metadata: {
      seoTitle: 'Professional Deep House Cleaning Services Nairobi',
      seoDescription: 'Comprehensive deep cleaning services for homes and apartments',
      keywords: ['house cleaning', 'deep cleaning', 'cleaning service nairobi']
    },
    isActive: true
  },
  {
    name: 'Custom Furniture Carpentry',
    description: 'Handcrafted custom furniture including cabinets, wardrobes, and built-in storage solutions.',
    category: 'carpentry',
    subcategory: 'furniture',
    basePrice: 25000,
    priceType: 'per-unit',
    currency: 'KES',
    duration: {
      estimated: 3,
      unit: 'days'
    },
    images: [
      {
        url: '/images/services/carpentry.jpg',
        public_id: 'carpentry_service_1'
      }
    ],
    tags: ['carpentry', 'furniture', 'custom', 'woodwork'],
    requirements: {
      tools: ['circular saw', 'drill', 'sanders', 'measuring tools'],
      materials: ['wood', 'screws', 'hinges', 'handles', 'finish'],
      skillLevel: 'expert'
    },
    availability: {
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [
        { start: '08:00', end: '17:00' }
      ]
    },
    metadata: {
      seoTitle: 'Custom Furniture Carpentry Services Kenya',
      seoDescription: 'Professional custom furniture and carpentry services',
      keywords: ['custom furniture', 'carpentry', 'woodwork kenya']
    },
    isActive: true
  },
  {
    name: 'Interior Wall Painting',
    description: 'Professional interior painting services for homes and offices with premium paint finishes.',
    category: 'painting',
    subcategory: 'interior',
    basePrice: 180,
    priceType: 'hourly',
    currency: 'KES',
    duration: {
      estimated: 8,
      unit: 'hours'
    },
    images: [
      {
        url: '/images/services/offer.png',
        public_id: 'painting_service_1'
      }
    ],
    tags: ['painting', 'interior', 'walls', 'decoration'],
    requirements: {
      tools: ['brushes', 'rollers', 'spray gun', 'drop cloths'],
      materials: ['paint', 'primer', 'sandpaper', 'masking tape'],
      skillLevel: 'intermediate'
    },
    availability: {
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: [
        { start: '08:00', end: '17:00' }
      ]
    },
    metadata: {
      seoTitle: 'Professional Interior Painting Services Nairobi',
      seoDescription: 'Expert interior wall painting with premium finishes',
      keywords: ['interior painting', 'wall painting', 'painter nairobi']
    },
    isActive: true
  },
  {
    name: 'Garden Landscaping Design',
    description: 'Complete garden design and landscaping services including plant selection and layout.',
    category: 'gardening',
    subcategory: 'landscaping',
    basePrice: 12000,
    priceType: 'fixed',
    currency: 'KES',
    duration: {
      estimated: 2,
      unit: 'days'
    },
    images: [],
    tags: ['gardening', 'landscaping', 'design', 'plants'],
    requirements: {
      tools: ['shovels', 'pruning shears', 'wheelbarrow', 'measuring tape'],
      materials: ['plants', 'soil', 'fertilizer', 'mulch'],
      skillLevel: 'intermediate'
    },
    availability: {
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: [
        { start: '07:00', end: '16:00' }
      ]
    },
    metadata: {
      seoTitle: 'Professional Garden Landscaping Services Kenya',
      seoDescription: 'Expert garden design and landscaping services',
      keywords: ['garden landscaping', 'garden design', 'landscaping kenya']
    },
    isActive: true
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solutil');
    console.log('Connected to MongoDB');

    // Clear existing services (optional)
    // await Service.deleteMany({});
    // console.log('Cleared existing services');

    // Insert sample services
    const createdServices = await Service.insertMany(sampleServices);
    console.log(`Created ${createdServices.length} sample services:`);
    
    createdServices.forEach(service => {
      console.log(`- ${service.name} (${service.category})`);
    });

    // Update some services to have ratings and bookings
    await Service.findByIdAndUpdate(createdServices[0]._id, {
      'rating.average': 4.8,
      'rating.count': 24,
      bookingCount: 45,
      isPopular: true
    });

    await Service.findByIdAndUpdate(createdServices[1]._id, {
      'rating.average': 4.6,
      'rating.count': 18,
      bookingCount: 32
    });

    await Service.findByIdAndUpdate(createdServices[2]._id, {
      'rating.average': 4.9,
      'rating.count': 31,
      bookingCount: 67,
      isPopular: true
    });

    console.log('Updated sample services with ratings and booking counts');

  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedServices();
}

module.exports = seedServices;
