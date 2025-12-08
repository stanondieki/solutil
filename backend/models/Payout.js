const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // One payout per booking
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amounts: {
    totalAmount: {
      type: Number,
      required: true
    },
    commissionAmount: {
      type: Number,
      required: true
    },
    payoutAmount: {
      type: Number,
      required: true
    },
    commissionRate: {
      type: Number,
      default: 30 // 30% commission
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  status: {
    type: String,
    enum: [
      'awaiting_payment', // Waiting for client to pay
      'pending',          // Waiting for 1-hour delay
      'ready',            // Ready to process
      'processing',       // Being sent to Paystack
      'completed',        // Successfully paid out
      'failed',           // Payout failed
      'cancelled'         // Cancelled/refunded
    ],
    default: 'pending'
  },
  paystack: {
    transferCode: String,     // Paystack transfer reference
    recipientCode: String,    // Provider's Paystack recipient code
    transferId: String,       // Paystack transfer ID
    sessionId: String,        // Transfer session ID
    transferDate: Date,       // When transfer was initiated
    completedAt: Date,        // When transfer was completed
    failureReason: String     // If transfer failed
  },
  timeline: {
    serviceCompleted: {
      type: Date,
      required: true
    },
    payoutScheduled: {
      type: Date,
      required: true // serviceCompleted + 1 hour
    },
    payoutProcessed: Date,
    payoutCompleted: Date,
    payoutFailed: Date
  },
  metadata: {
    bookingReference: String,
    serviceTitle: String,
    providerName: String,
    clientEmail: String,
    paymentReference: String, // Original payment reference
    attemptCount: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
payoutSchema.index({ status: 1, 'timeline.payoutScheduled': 1 });
payoutSchema.index({ provider: 1, status: 1 });
payoutSchema.index({ booking: 1 });
payoutSchema.index({ 'timeline.payoutScheduled': 1 });

// Static method to calculate payout amounts
payoutSchema.statics.calculateAmounts = function(totalAmount, commissionRate = 30) {
  const commissionAmount = Math.round(totalAmount * (commissionRate / 100));
  const payoutAmount = totalAmount - commissionAmount;
  
  return {
    totalAmount,
    commissionAmount,
    payoutAmount,
    commissionRate
  };
};

// Instance method to check if payout is ready
payoutSchema.methods.isReadyForPayout = function() {
  return this.status === 'pending' && 
         new Date() >= this.timeline.payoutScheduled;
};

// Instance method to mark as ready
payoutSchema.methods.markAsReady = function() {
  if (this.isReadyForPayout()) {
    this.status = 'ready';
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to handle payment completion
payoutSchema.methods.onPaymentCompleted = function() {
  if (this.status === 'awaiting_payment') {
    this.status = 'pending';
    return this.save();
  }
  return Promise.resolve(this);
};

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;