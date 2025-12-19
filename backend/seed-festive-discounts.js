/**
 * Seed Festive Discount Codes
 * Run with: node seed-festive-discounts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DiscountCode = require('./models/DiscountCode');

const festiveDiscounts = [
  {
    code: 'CHRISTMAS25',
    description: 'Christmas Special - 25% off all services',
    discountType: 'percentage',
    discountValue: 25,
    minOrderAmount: 2000,
    maxDiscount: 5000,
    validFrom: new Date('2025-12-01'),
    validUntil: new Date('2025-12-26'),
    usageLimit: 500,
    perUserLimit: 1,
    applicableCategories: [],
    isActive: true,
    isFestive: true
  },
  {
    code: 'NEWYEAR2026',
    description: 'New Year Celebration - 20% off',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 1500,
    maxDiscount: 4000,
    validFrom: new Date('2025-12-26'),
    validUntil: new Date('2026-01-10'),
    usageLimit: 300,
    perUserLimit: 1,
    applicableCategories: [],
    isActive: true,
    isFestive: true
  },
  {
    code: 'HOLIDAY15',
    description: 'Holiday Season - 15% off',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1000,
    maxDiscount: 3000,
    validFrom: new Date('2025-12-01'),
    validUntil: new Date('2026-01-05'),
    usageLimit: 1000,
    perUserLimit: 2,
    applicableCategories: [],
    isActive: true,
    isFestive: true
  },
  {
    code: 'FESTIVE500',
    description: 'Festive Fixed Discount - KES 500 off',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 3000,
    maxDiscount: null,
    validFrom: new Date('2025-12-01'),
    validUntil: new Date('2026-01-15'),
    usageLimit: 200,
    perUserLimit: 1,
    applicableCategories: [],
    isActive: true,
    isFestive: true
  },
  {
    code: 'CLEANING20',
    description: 'Holiday Cleaning Special - 20% off cleaning services',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 1500,
    maxDiscount: 2500,
    validFrom: new Date('2025-12-01'),
    validUntil: new Date('2026-01-05'),
    usageLimit: 150,
    perUserLimit: 1,
    applicableCategories: ['cleaning', 'Cleaning'],
    isActive: true,
    isFestive: true
  }
];

async function seedDiscounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check for existing codes
    for (const discount of festiveDiscounts) {
      const existing = await DiscountCode.findOne({ code: discount.code });
      
      if (existing) {
        console.log(`⏭️  Code ${discount.code} already exists, skipping...`);
      } else {
        await DiscountCode.create(discount);
        console.log(`🎄 Created discount code: ${discount.code} - ${discount.description}`);
      }
    }

    console.log('\n✅ Festive discount codes seeded successfully!');
    
    // Show summary
    const allFestive = await DiscountCode.find({ isFestive: true });
    console.log(`\n📊 Total festive codes in database: ${allFestive.length}`);
    
    allFestive.forEach(code => {
      console.log(`   • ${code.code}: ${code.discountType === 'percentage' ? code.discountValue + '%' : 'KES ' + code.discountValue} off`);
    });

  } catch (error) {
    console.error('❌ Error seeding discounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedDiscounts();
