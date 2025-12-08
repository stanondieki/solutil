const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Updated to reference User instead of Provider
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'serviceType', // Dynamic reference based on serviceType field
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Service', 'ProviderService'],
    default: 'ProviderService'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    start: {
      type: String,
      required: true // "09:00"
    },
    end: {
      type: String,
      required: true // "11:00"
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    instructions: String
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    discount: {
      amount: Number,
      reason: String
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'mpesa', 'mobile-money', 'cash', 'bank-transfer'],
      required: true
    },
    timing: {
      type: String,
      enum: ['pay-now', 'pay-after'],
      default: 'pay-after'
    },
    status: {
      type: String,
      enum: ['pending', 'initiated', 'processing', 'completed', 'failed', 'refunded', 'payment_requested'],
      default: 'pending'
    },
    reference: String, // Paystack reference
    transactionId: String, // Paystack transaction ID
    gateway: {
      type: String,
      enum: ['paystack', 'mpesa', 'manual'],
      default: 'paystack'
    },
    gatewayResponse: Object, // Store full gateway response
    amount: Number, // Actual paid amount
    currency: {
      type: String,
      default: 'KES'
    },
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    paymentLink: String, // For pay-after scenarios
    paymentLinkExpiry: Date,
    // Provider-initiated payment request fields
    paystack_reference: String, // Paystack transaction reference for provider-initiated payments
    payment_url: String, // Paystack payment URL sent to client
    requested_at: Date, // When provider requested payment
    completed_at: Date, // When client completed payment
    paystack_data: Object // Store Paystack verification response
  },
  notes: {
    client: String,
    provider: String,
    internal: String
  },
  timeline: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  completionDetails: {
    startTime: Date,
    endTime: Date,
    workDescription: String,
    images: [{
      public_id: String,
      url: String,
      caption: String
    }],
    materialsUsed: [String],
    additionalWork: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundEligible: Boolean,
    refundPercentage: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'system', 'status-update'],
      default: 'message'
    }
  }],
  providerPayout: {
    transferCode: String, // Paystack transfer code or M-Pesa transaction ID
    reference: String, // Unique payout reference
    amount: Number, // Amount transferred to provider
    platformCommission: Number, // Platform commission deducted
    status: {
      type: String,
      enum: ['initiated', 'success', 'failed', 'reversed'],
      default: 'initiated'
    },
    payoutMethod: { type: String, enum: ['bank', 'mpesa'], default: 'bank' },
    initiatedAt: Date,
    completedAt: Date,
    recipientCode: String, // Provider's transfer recipient code or M-Pesa reference
    failureReason: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate booking number
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `SOL-${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Pre-save middleware to add timeline entry
bookingSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      // updatedBy will be set in the controller
    });
  }
  next();
});

// Virtual for duration in hours
bookingSchema.virtual('duration').get(function() {
  if (this.completionDetails.startTime && this.completionDetails.endTime) {
    const diff = this.completionDetails.endTime - this.completionDetails.startTime;
    return Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Round to 2 decimal places
  }
  return null;
});

// Static method to get booking statistics
bookingSchema.statics.getStats = function(filters = {}) {
  return this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.totalAmount' }
      }
    }
  ]);
};

// Static method to get recent bookings
bookingSchema.statics.getRecentBookings = async function(userId, userType, limit = 10) {
  const matchCriteria = userType === 'client' 
    ? { client: userId }
    : { 'provider.user': userId };

  const bookings = await this.find(matchCriteria)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('client', 'name email phone avatar')
    .populate('provider', 'name email phone userType')
    .populate('review', 'rating comment');

  // Manually populate services based on serviceType
  for (let booking of bookings) {
    if (booking.service && booking.serviceType === 'ProviderService') {
      const ProviderService = require('./ProviderService');
      const service = await ProviderService.findById(booking.service)
        .populate('providerId', 'name email');
      booking.service = service;
    } else if (booking.service && booking.serviceType === 'Service') {
      const Service = require('./Service');
      const service = await Service.findById(booking.service);
      booking.service = service;
    }
  }

  return bookings;
};

// Index for better query performance (bookingNumber already unique, so no separate index needed)
bookingSchema.index({ client: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
