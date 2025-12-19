const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // No max for percentage discounts if not set
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // Unlimited if not set
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1 // Each user can use once by default
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  applicableCategories: [{
    type: String // Service category IDs, empty means all categories
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFestive: {
    type: Boolean,
    default: false // Flag for festive season codes
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for quick lookup
discountCodeSchema.index({ code: 1 });
discountCodeSchema.index({ validFrom: 1, validUntil: 1 });
discountCodeSchema.index({ isActive: 1 });

// Method to check if code is valid
discountCodeSchema.methods.isValid = function(userId, orderAmount, categoryId) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, reason: 'This discount code is no longer active' };
  }
  
  // Check date validity
  if (now < this.validFrom) {
    return { valid: false, reason: 'This discount code is not yet active' };
  }
  
  if (now > this.validUntil) {
    return { valid: false, reason: 'This discount code has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'This discount code has reached its usage limit' };
  }
  
  // Check minimum order amount
  if (orderAmount && orderAmount < this.minOrderAmount) {
    return { 
      valid: false, 
      reason: `Minimum order amount of KES ${this.minOrderAmount.toLocaleString()} required` 
    };
  }
  
  // Check per-user limit
  if (userId && this.perUserLimit) {
    const userUsage = this.usedBy.filter(u => u.user.toString() === userId.toString()).length;
    if (userUsage >= this.perUserLimit) {
      return { valid: false, reason: 'You have already used this discount code' };
    }
  }
  
  // Check category applicability
  if (categoryId && this.applicableCategories.length > 0) {
    if (!this.applicableCategories.includes(categoryId)) {
      return { valid: false, reason: 'This discount code is not applicable for this service category' };
    }
  }
  
  return { valid: true };
};

// Method to calculate discount
discountCodeSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }
  
  // Discount cannot exceed order amount
  if (discount > orderAmount) {
    discount = orderAmount;
  }
  
  return Math.round(discount);
};

// Method to record usage
discountCodeSchema.methods.recordUsage = async function(userId) {
  this.usedCount += 1;
  this.usedBy.push({ user: userId, usedAt: new Date() });
  await this.save();
};

// Static method to find active festive codes
discountCodeSchema.statics.getFestiveCodes = async function() {
  const now = new Date();
  return this.find({
    isActive: true,
    isFestive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  }).select('-usedBy');
};

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
