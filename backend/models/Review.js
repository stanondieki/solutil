const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per booking per reviewer
reviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

// Index for efficient querying
reviewSchema.index({ service: 1, rating: -1 });
reviewSchema.index({ provider: 1, createdAt: -1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  // This could be enhanced with actual helpful votes tracking
  return this.helpfulVotes > 0 ? Math.round((this.helpfulVotes / (this.helpfulVotes + 1)) * 100) : 0;
});

// Static method to get average rating for a service
reviewSchema.statics.getAverageRating = async function(serviceId) {
  const result = await this.aggregate([
    { $match: { service: mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

// Static method to get provider rating
reviewSchema.statics.getProviderRating = async function(providerId) {
  const result = await this.aggregate([
    { $match: { provider: mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);
