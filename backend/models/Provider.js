const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
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
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  phone: String,
  email: String,
  isActive: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
providerSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'provider'
});

module.exports = mongoose.model('Provider', providerSchema);
