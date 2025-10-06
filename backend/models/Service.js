// === CURRENT SERVICE MODEL ANALYSIS ===

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'gardening', 'appliance-repair', 'hvac', 'roofing', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceType: {
    type: String,
    enum: ['fixed', 'hourly', 'per-unit'],
    default: 'fixed'
  },
  currency: {
    type: String,
    default: 'KES'
  },
  duration: {
    estimated: {
      type: Number, // in minutes
      required: true
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'hours'
    }
  },
  images: [{
    public_id: String,
    url: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: {
    tools: [String],
    materials: [String],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    }
  },
  availability: {
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      start: String, // "09:00"
      end: String    // "17:00"
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for providers offering this service
serviceSchema.virtual('providers', {
  ref: 'Provider',
  localField: '_id',
  foreignField: 'services'
});

// Pre-save middleware to update popularity
serviceSchema.pre('save', function(next) {
  // Mark as popular if rating is above 4.5 and has more than 10 bookings
  this.isPopular = this.rating.average >= 4.5 && this.bookingCount >= 10;
  next();
});

// Static method to get popular services
serviceSchema.statics.getPopularServices = function(limit = 6) {
  return this.find({ isActive: true, isPopular: true })
    .sort({ 'rating.average': -1, bookingCount: -1 })
    .limit(limit)
    .populate('reviews', 'rating comment user createdAt');
};

// Static method to search services
serviceSchema.statics.searchServices = function(query, filters = {}) {
  const searchCriteria = {
    isActive: true,
    ...filters
  };

  if (query) {
    searchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  return this.find(searchCriteria)
    .sort({ isPopular: -1, 'rating.average': -1 })
    .populate('reviews', 'rating comment user createdAt');
};

// Index for better search performance
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ isPopular: 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ basePrice: 1 });

module.exports = mongoose.model('Service', serviceSchema);
