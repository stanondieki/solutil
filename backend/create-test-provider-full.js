const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestProviderWithFullData() {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solutil', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create a comprehensive test provider
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    const testProvider = new User({
      name: 'Test Provider Full Data',
      email: 'testprovider@solutil.com',
      password: hashedPassword,
      phone: '+254700123456',
      userType: 'provider',
      providerStatus: 'under_review',
      isActive: true,
      profilePicture: 'https://via.placeholder.com/150',
      providerProfile: {
        experience: '5+ years',
        bio: 'I am a highly experienced professional with over 5 years in the industry. I specialize in multiple service categories and have built a strong reputation for quality work and excellent customer service. My attention to detail and commitment to excellence sets me apart.',
        
        // Service categories with comprehensive details
        services: [
          {
            category: 'Home Cleaning',
            subServices: ['Deep Cleaning', 'Regular Cleaning', 'Window Cleaning', 'Carpet Cleaning'],
            experience: '5+ years',
            description: 'Professional home cleaning services with eco-friendly products and attention to detail.'
          },
          {
            category: 'Plumbing',
            subServices: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Fixture Installation'],
            experience: '3-5 years', 
            description: 'Licensed plumber with expertise in residential and commercial plumbing solutions.'
          },
          {
            category: 'Electrical Work',
            subServices: ['Wiring', 'Lighting Installation', 'Socket Repair', 'Electrical Troubleshooting'],
            experience: '3-5 years',
            description: 'Certified electrician providing safe and reliable electrical services.'
          }
        ],
        
        // Skills array (legacy support)
        skills: ['Home Cleaning', 'Plumbing', 'Electrical Work', 'Maintenance'],
        
        // Availability and scheduling
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          hours: {
            start: '08:00',
            end: '18:00'
          },
          minimumNotice: 4,
          advanceBooking: 30
        },
        
        // Service areas
        serviceAreas: ['Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Kileleshwa', 'Lavington'],
        
        // Home address
        homeAddress: {
          street: '123 Test Street',
          area: 'Westlands',
          postalCode: '00100'
        },
        
        // Emergency contact
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phoneNumber: '+254700987654'
        },
        
        // Languages
        languages: ['English', 'Swahili', 'French'],
        
        // Professional memberships
        professionalMemberships: [
          {
            organization: 'Kenya Association of Professional Cleaners',
            membershipId: 'KAPC-2023-001',
            certificateUrl: 'https://example.com/cert1.pdf'
          },
          {
            organization: 'Licensed Plumbers Association',
            membershipId: 'LPA-2022-567',
            certificateUrl: 'https://example.com/cert2.pdf'
          }
        ],
        
        // Payment information
        paymentInfo: {
          preferredMethod: 'mpesa',
          mpesaNumber: '+254700123456',
          bankDetails: {
            bankName: 'Equity Bank',
            accountName: 'Test Provider Full Data',
            accountNumber: '1234567890',
            branchCode: '068'
          }
        },
        
        // Material sourcing
        materialSourcing: {
          option: 'provider',
          details: 'I provide all necessary tools and eco-friendly cleaning supplies. For plumbing and electrical work, I source high-quality materials and can provide cost estimates upfront.'
        },
        
        // Portfolio projects
        portfolio: [
          {
            title: 'Complete Home Renovation - Westlands Villa',
            description: 'Full home cleaning and maintenance project including deep cleaning, plumbing updates, and electrical work. Client was extremely satisfied with the attention to detail.',
            category: 'Home Cleaning',
            beforeImageUrl: 'https://via.placeholder.com/400x300?text=Before',
            afterImageUrl: 'https://via.placeholder.com/400x300?text=After',
            completionDate: new Date('2024-09-15')
          },
          {
            title: 'Commercial Office Deep Clean',
            description: 'Weekly commercial cleaning contract for a 50-person office. Maintained high standards and received excellent feedback.',
            category: 'Home Cleaning',
            beforeImageUrl: 'https://via.placeholder.com/400x300?text=Office+Before',
            afterImageUrl: 'https://via.placeholder.com/400x300?text=Office+After',
            completionDate: new Date('2024-10-01')
          },
          {
            title: 'Kitchen Plumbing Overhaul',
            description: 'Complete kitchen plumbing renovation including new pipes, fixtures, and water filtration system installation.',
            category: 'Plumbing',
            beforeImageUrl: 'https://via.placeholder.com/400x300?text=Kitchen+Before',
            afterImageUrl: 'https://via.placeholder.com/400x300?text=Kitchen+After',
            completionDate: new Date('2024-08-20')
          }
        ],
        
        // Additional profile data
        hourlyRate: 2500,
        completedJobs: 47,
        rating: 4.8,
        reviewCount: 32
      },
      
      // Provider documents
      providerDocuments: {
        nationalId: {
          uploaded: new Date('2024-09-01'),
          verified: true,
          url: 'https://example.com/national-id.pdf',
          public_id: 'docs/national-id-123',
          originalName: 'national-id.pdf',
          mimetype: 'application/pdf',
          size: 245760
        },
        businessLicense: {
          uploaded: new Date('2024-09-02'),
          verified: false,
          url: 'https://example.com/business-license.pdf',
          public_id: 'docs/business-license-456',
          originalName: 'business-license.pdf',
          mimetype: 'application/pdf',
          size: 187420
        },
        certificate: {
          uploaded: new Date('2024-09-03'),
          verified: true,
          url: 'https://example.com/certificate.pdf',
          public_id: 'docs/certificate-789',
          originalName: 'professional-certificate.pdf',
          mimetype: 'application/pdf',
          size: 156890
        },
        goodConductCertificate: {
          uploaded: new Date('2024-09-04'),
          verified: false,
          url: 'https://example.com/good-conduct.pdf',
          public_id: 'docs/good-conduct-101',
          originalName: 'good-conduct-certificate.pdf',
          mimetype: 'application/pdf',
          size: 198450
        }
      }
    });

    await testProvider.save();
    
    console.log('✅ Test provider created successfully!');
    console.log('📧 Email: testprovider@solutil.com');
    console.log('🔑 Password: testpass123');
    console.log('🆔 Provider ID:', testProvider._id);
    console.log('\n🎯 This provider has comprehensive onboarding data for testing the admin interface!');
    
  } catch (error) {
    console.error('❌ Error creating test provider:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
createTestProviderWithFullData();