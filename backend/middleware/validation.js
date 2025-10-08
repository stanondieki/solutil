const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    console.log('=== VALIDATION ERRORS ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Validation errors:', JSON.stringify(errorMessages, null, 2));

    return next(new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  
  next();
};
