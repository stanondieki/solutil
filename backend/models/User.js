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
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
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

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('User', userSchema);
