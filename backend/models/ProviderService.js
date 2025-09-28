const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Service title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'gardening', 'appliance-repair', 'hvac', 'roofing', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceType: {
    type: String,
    enum: ['fixed', 'hourly', 'quote'],
    default: 'fixed'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  images: [{
    type: String // URLs of uploaded images
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  serviceArea: [{
    type: String // Areas where service is available
  }],
  availableHours: {
    start: {
      type: String,
      required: true,
      default: '08:00'
    },
    end: {
      type: String,
      required: true,
      default: '18:00'
    }
  },
  tags: [{
    type: String // Service tags like 'emergency', '24/7', etc.
  }],
  providerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Provider ID is required']
  },
  // Statistics (will be updated by bookings)
  totalBookings: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for provider info
providerServiceSchema.virtual('provider', {
  ref: 'User',
  localField: 'providerId',
  foreignField: '_id'
});

// Virtual for bookings
providerServiceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'serviceId'
});

// Index for better performance
providerServiceSchema.index({ providerId: 1 });
providerServiceSchema.index({ category: 1 });
providerServiceSchema.index({ isActive: 1 });
providerServiceSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware
providerServiceSchema.pre('save', function(next) {
  // Ensure rating is within bounds
  if (this.rating > 5) this.rating = 5;
  if (this.rating < 0) this.rating = 0;
  next();
});

module.exports = mongoose.model('ProviderService', providerServiceSchema);