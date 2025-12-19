const DiscountCode = require('../models/DiscountCode');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Validate a discount code
exports.validateDiscountCode = catchAsync(async (req, res, next) => {
  const { code, orderAmount, categoryId } = req.body;
  
  if (!code) {
    return next(new AppError('Discount code is required', 400));
  }
  
  const discountCode = await DiscountCode.findOne({ 
    code: code.toUpperCase().trim() 
  });
  
  if (!discountCode) {
    return res.status(404).json({
      success: false,
      message: 'Invalid discount code'
    });
  }
  
  // Check validity
  const validationResult = discountCode.isValid(req.user?._id, orderAmount, categoryId);
  
  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      message: validationResult.reason
    });
  }
  
  // Calculate discount amount
  const discountAmount = discountCode.calculateDiscount(orderAmount || 0);
  
  res.status(200).json({
    success: true,
    message: 'Discount code is valid!',
    data: {
      code: discountCode.code,
      description: discountCode.description,
      discountType: discountCode.discountType,
      discountValue: discountCode.discountValue,
      discountAmount: discountAmount,
      minOrderAmount: discountCode.minOrderAmount,
      validUntil: discountCode.validUntil,
      isFestive: discountCode.isFestive
    }
  });
});

// Apply discount code to an order
exports.applyDiscountCode = catchAsync(async (req, res, next) => {
  const { code, orderAmount, categoryId } = req.body;
  
  if (!code || !orderAmount) {
    return next(new AppError('Discount code and order amount are required', 400));
  }
  
  const discountCode = await DiscountCode.findOne({ 
    code: code.toUpperCase().trim() 
  });
  
  if (!discountCode) {
    return res.status(404).json({
      success: false,
      message: 'Invalid discount code'
    });
  }
  
  // Check validity
  const validationResult = discountCode.isValid(req.user._id, orderAmount, categoryId);
  
  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      message: validationResult.reason
    });
  }
  
  // Calculate and return discount
  const discountAmount = discountCode.calculateDiscount(orderAmount);
  const finalAmount = orderAmount - discountAmount;
  
  res.status(200).json({
    success: true,
    message: `Discount of KES ${discountAmount.toLocaleString()} applied!`,
    data: {
      code: discountCode.code,
      originalAmount: orderAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      discountPercentage: Math.round((discountAmount / orderAmount) * 100)
    }
  });
});

// Get active festive discount codes (public endpoint)
exports.getFestiveDiscounts = catchAsync(async (req, res, next) => {
  const festiveCodes = await DiscountCode.getFestiveCodes();
  
  // Return public info only
  const publicCodes = festiveCodes.map(code => ({
    code: code.code,
    description: code.description,
    discountType: code.discountType,
    discountValue: code.discountValue,
    minOrderAmount: code.minOrderAmount,
    validUntil: code.validUntil
  }));
  
  res.status(200).json({
    success: true,
    data: publicCodes
  });
});

// Admin: Create discount code
exports.createDiscountCode = catchAsync(async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    validFrom,
    validUntil,
    usageLimit,
    perUserLimit,
    applicableCategories,
    isActive,
    isFestive
  } = req.body;
  
  // Check if code already exists
  const existingCode = await DiscountCode.findOne({ code: code.toUpperCase().trim() });
  if (existingCode) {
    return next(new AppError('Discount code already exists', 400));
  }
  
  const discountCode = await DiscountCode.create({
    code: code.toUpperCase().trim(),
    description,
    discountType: discountType || 'percentage',
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount,
    validFrom: validFrom || new Date(),
    validUntil,
    usageLimit,
    perUserLimit: perUserLimit || 1,
    applicableCategories: applicableCategories || [],
    isActive: isActive !== false,
    isFestive: isFestive || false,
    createdBy: req.user._id
  });
  
  res.status(201).json({
    success: true,
    message: 'Discount code created successfully',
    data: discountCode
  });
});

// Admin: Get all discount codes
exports.getAllDiscountCodes = catchAsync(async (req, res, next) => {
  const { active, festive, page = 1, limit = 20 } = req.query;
  
  const filter = {};
  if (active !== undefined) filter.isActive = active === 'true';
  if (festive !== undefined) filter.isFestive = festive === 'true';
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [discountCodes, total] = await Promise.all([
    DiscountCode.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    DiscountCode.countDocuments(filter)
  ]);
  
  res.status(200).json({
    success: true,
    data: discountCodes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Admin: Update discount code
exports.updateDiscountCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const discountCode = await DiscountCode.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!discountCode) {
    return next(new AppError('Discount code not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Discount code updated successfully',
    data: discountCode
  });
});

// Admin: Delete discount code
exports.deleteDiscountCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const discountCode = await DiscountCode.findByIdAndDelete(id);
  
  if (!discountCode) {
    return next(new AppError('Discount code not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Discount code deleted successfully'
  });
});

// Admin: Get discount code stats
exports.getDiscountStats = catchAsync(async (req, res, next) => {
  const stats = await DiscountCode.aggregate([
    {
      $group: {
        _id: null,
        totalCodes: { $sum: 1 },
        activeCodes: { 
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        festiveCodes: {
          $sum: { $cond: ['$isFestive', 1, 0] }
        },
        totalUsage: { $sum: '$usedCount' }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalCodes: 0,
      activeCodes: 0,
      festiveCodes: 0,
      totalUsage: 0
    }
  });
});
