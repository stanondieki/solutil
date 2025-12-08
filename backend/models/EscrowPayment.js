const mongoose = require('mongoose');

const escrowPaymentSchema = new mongoose.Schema({
  // M-Pesa transaction identifiers
  checkoutRequestID: {
    type: String,
    required: true,
    unique: true
  },
  merchantRequestID: {
    type: String,
    required: true
  },
  mpesaReceiptNumber: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be greater than 0']
  },
  phoneNumber: {
    type: String,
    required: true
  },
  accountReference: {
    type: String,
    required: true
  },
  transactionDesc: {
    type: String,
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'disputed', 'released'],
    default: 'pending'
  },
  resultCode: {
    type: Number
  },
  resultDesc: {
    type: String
  },
  transactionDate: {
    type: String // M-Pesa format: YYYYMMDDHHMMSS
  },
  
  // Booking and service details
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  
  // Commission and payout details
  commissionRate: {
    type: Number,
    default: 0.10, // 10% commission
    min: 0,
    max: 1
  },
  commissionAmount: {
    type: Number,
    default: function() {
      return this.amount * this.commissionRate;
    }
  },
  providerAmount: {
    type: Number,
    default: function() {
      return this.amount - this.commissionAmount;
    }
  },
  
  // Release details
  releasedAt: {
    type: Date
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  releaseMethod: {
    type: String,
    enum: ['mpesa', 'bank_transfer', 'manual']
  },
  providerPayoutReference: {
    type: String // Reference for provider payout transaction
  },
  
  // Dispute information
  disputeReason: {
    type: String
  },
  disputedAt: {
    type: Date
  },
  disputeResolvedAt: {
    type: Date
  },
  disputeResolution: {
    type: String
  },
  
  // Review and rating
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Audit trail
  events: [{
    type: {
      type: String,
      enum: ['created', 'payment_received', 'disputed', 'resolved', 'released', 'failed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    data: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// checkoutRequestID is already unique, so no separate index needed
// mpesaReceiptNumber is already unique, so no separate index needed
escrowPaymentSchema.index({ bookingId: 1 });
escrowPaymentSchema.index({ clientId: 1 });
escrowPaymentSchema.index({ providerId: 1 });
escrowPaymentSchema.index({ status: 1 });
escrowPaymentSchema.index({ createdAt: -1 });

// Virtual for formatted amount
escrowPaymentSchema.virtual('formattedAmount').get(function() {
  return `KSh ${this.amount.toLocaleString()}`;
});

// Virtual for formatted commission
escrowPaymentSchema.virtual('formattedCommission').get(function() {
  return `KSh ${this.commissionAmount.toLocaleString()}`;
});

// Virtual for formatted provider amount
escrowPaymentSchema.virtual('formattedProviderAmount').get(function() {
  return `KSh ${this.providerAmount.toLocaleString()}`;
});

// Methods
escrowPaymentSchema.methods.addEvent = function(type, description, data = {}) {
  this.events.push({
    type,
    description,
    data,
    timestamp: new Date()
  });
  return this.save();
};

escrowPaymentSchema.methods.markAsCompleted = function(mpesaData) {
  this.status = 'completed';
  this.mpesaReceiptNumber = mpesaData.mpesaReceiptNumber;
  this.transactionDate = mpesaData.transactionDate;
  this.resultCode = mpesaData.resultCode;
  this.resultDesc = mpesaData.resultDesc;
  
  return this.addEvent('payment_received', 'Payment received from client', mpesaData);
};

escrowPaymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.resultDesc = reason;
  
  return this.addEvent('failed', 'Payment failed', { reason });
};

escrowPaymentSchema.methods.initiateDispute = function(reason, userId) {
  this.status = 'disputed';
  this.disputeReason = reason;
  this.disputedAt = new Date();
  
  return this.addEvent('disputed', 'Payment disputed by client', { reason, userId });
};

escrowPaymentSchema.methods.resolveDispute = function(resolution, resolvedBy) {
  this.status = 'completed';
  this.disputeResolution = resolution;
  this.disputeResolvedAt = new Date();
  
  return this.addEvent('resolved', 'Dispute resolved', { resolution, resolvedBy });
};

escrowPaymentSchema.methods.releaseToProvider = function(releaseData) {
  this.status = 'released';
  this.releasedAt = new Date();
  this.releasedBy = releaseData.releasedBy;
  this.rating = releaseData.rating;
  this.review = releaseData.review;
  this.releaseMethod = releaseData.method || 'mpesa';
  this.providerPayoutReference = releaseData.payoutReference;
  
  return this.addEvent('released', 'Payment released to provider', releaseData);
};

// Static methods
escrowPaymentSchema.statics.findByCheckoutRequestID = function(checkoutRequestID) {
  return this.findOne({ checkoutRequestID });
};

escrowPaymentSchema.statics.findByBooking = function(bookingId) {
  return this.findOne({ bookingId });
};

escrowPaymentSchema.statics.getProviderEarnings = function(providerId, startDate, endDate) {
  const match = {
    providerId: mongoose.Types.ObjectId(providerId),
    status: 'released'
  };
  
  if (startDate || endDate) {
    match.releasedAt = {};
    if (startDate) match.releasedAt.$gte = startDate;
    if (endDate) match.releasedAt.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$providerAmount' },
        totalTransactions: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
};

escrowPaymentSchema.statics.getCompanyRevenue = function(startDate, endDate) {
  const match = {
    status: { $in: ['completed', 'released'] }
  };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalCommission: { $sum: '$commissionAmount' },
        totalPaidToProviders: { $sum: '$providerAmount' },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to calculate commission and provider amounts
escrowPaymentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('commissionRate')) {
    this.commissionAmount = Math.round(this.amount * this.commissionRate);
    this.providerAmount = this.amount - this.commissionAmount;
  }
  next();
});

module.exports = mongoose.model('EscrowPayment', escrowPaymentSchema);
