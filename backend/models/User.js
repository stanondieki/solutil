const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  userType: {
    type: String,
    enum: ['client', 'provider', 'admin'],
    default: 'client'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/solutil/image/upload/v1/defaults/avatar.png'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Kenya'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  // Provider-specific fields
  providerStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'],
    default: function() {
      return this.userType === 'provider' ? 'pending' : undefined;
    }
  },
  providerDocuments: {
    nationalId: {
      url: String,
      public_id: String,
      uploaded: { type: Date },
      verified: { type: Boolean, default: false }
    },
    businessLicense: {
      url: String,
      public_id: String,
      uploaded: { type: Date },
      verified: { type: Boolean, default: false }
    },
    certificate: {
      url: String,
      public_id: String,
      uploaded: { type: Date },
      verified: { type: Boolean, default: false }
    },
    goodConductCertificate: {
      url: String,
      public_id: String,
      uploaded: { type: Date },
      verified: { type: Boolean, default: false }
    },
    portfolio: [{
      url: String,
      public_id: String,
      description: String,
      uploaded: { type: Date }
    }]
  },
  providerProfile: {
    experience: String,
    skills: [String],
    hourlyRate: Number,
    availability: {
      days: [String], // ['monday', 'tuesday', etc.]
      hours: {
        start: String, // '09:00'
        end: String    // '17:00'
      }
    },
    serviceAreas: [String], // Cities/areas they serve
    bio: String,
    homeAddress: {
      street: String,
      area: String,
      postalCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String
    },
    languages: [String],
    professionalMemberships: [{
      organization: String,
      membershipId: String,
      certificateUrl: String
    }],
    paymentInfo: {
      preferredMethod: { type: String, enum: ['mpesa', 'bank', 'both'], default: 'mpesa' },
      mpesaNumber: String,
      bankDetails: {
        bankName: String,
        accountNumber: String,
        accountName: String,
        branchCode: String
      }
    },
    materialSourcing: {
      option: { type: String, enum: ['provider', 'client', 'both'], default: 'client' },
      markup: { type: Number, default: 0 },
      details: String
    },
    policies: {
      cancellation: {
        allowCancellation: { type: Boolean, default: true },
        timeLimit: { type: Number, default: 24 },
        refundPercentage: { type: Number, default: 100 },
        conditions: String
      },
      refund: {
        timeframe: { type: Number, default: 5 },
        method: { type: String, enum: ['full', 'partial', 'none'], default: 'full' },
        conditions: String
      }
    },
    rateStructure: {
      baseHourlyRate: { type: Number, default: 0 },
      emergencyRate: { type: Number, default: 1.5 },
      weekendRate: { type: Number, default: 1.2 },
      materialHandling: { type: Number, default: 0 },
      travelFee: { type: Number, default: 0 }
    },
    portfolio: [{
      title: String,
      description: String,
      category: String,
      beforeImageUrl: String,
      afterImageUrl: String,
      completionDate: Date,
      clientFeedback: String
    }],
    services: [{ // Services created during onboarding
      title: String,
      description: String,
      category: String,
      price: Number,
      priceType: { type: String, enum: ['fixed', 'hourly', 'quote'], default: 'hourly' }
    }],
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalCompletedBookings: { type: Number, default: 0 },
    payoutDetails: {
      payoutMethod: { type: String, enum: ['bank', 'mpesa'], default: 'bank' },
      // Bank details (Nigeria - Paystack)
      recipientCode: String, // Paystack transfer recipient code
      bankCode: String,
      accountNumber: String,
      accountName: String,
      bankName: String,
      // M-Pesa details (Kenya)
      mpesaNumber: String, // Format: 254XXXXXXXXX
      createdAt: Date
    }
  },
  adminNotes: [{
    note: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['approval', 'rejection', 'warning', 'general'] }
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedAt: Date,
  submittedAt: Date,
  rejectionReason: String,
  socialLogins: {
    google: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's bookings
userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'client'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Index for better query performance (email already unique, so no separate index needed)
userSchema.index({ role: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
