const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// Protect private routes
exports.protect = handleAsync(async (req, res, next) => {
  // Get token
  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if(!token) {
    return next(new AppError('Not authorized to access this page!', 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Get id from decoded token and return error if user with this id does not exist
  const user = await User.findById(decoded.id).populate('quotes');
  if(!user) {
    return next(new AppError('User does not exist.', 404));
  }

  // Set user
  req.user = user;
  next();
});