const handleAsync = require('../utils/handleAsync');
const Quote = require('../models/Quote');
const AppError = require('../utils/AppError');

// @desc     Create quote
// @route    POST /api/v1/quotes
// @access   Private
exports.addQuote = handleAsync(async (req, res, next) => {
  const { text, author } = req.body;

  const quote = await Quote.create({
    text, 
    author,
    createdBy: req.user._id
  });

  if(!quote) {
    return next(new AppError('Something went wrong! Please try again later!', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Quote created!',
    data: quote
  });
});

// @desc     Get all quotes
// @route    GET /api/v1/quotes
// @access   Public
exports.getQuotes = handleAsync(async (req, res, next) => {
  const quotes = await Quote.find().populate({ path: 'createdBy', select: '-createdAt'});

  res.status(200).json({
    success: true,
    results: quotes.length,
    data: quotes.map(quote => quote.toObject({ getters: true })).reverse()
  });
});

// @desc     Get all user quotes by userId
// @route    POST /api/v1/quotes/user/:userId
// @access   Public
exports.getQuotesByUserId = handleAsync(async (req, res, next) => {
  const quotes = await Quote.find({ createdBy: req.params.userId }).populate({ path: 'createdBy', select: '-createdAt'});

  res.status(200).json({
    success: true,
    results: quotes.length,
    data: quotes.map(quote => quote.toObject({ getters: true })).reverse()
  });
});

// @desc     Get quote by id
// @route    GET /api/v1/quotes/:id
// @access   PRIVATE
exports.getQuoteById = handleAsync(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id).populate({ path: 'createdBy', select: '-createdAt'});

  if(!quote) {
    return next(new AppError('Quote not found!', 404));
  }

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc     Edit quote
// @route    PATCH /api/v1/quotes/:id
// @access   Private
exports.editQuote = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  const quote = await Quote.findById(id);

  if(!quote) {
    return next(new AppError('Quote with this id cannot be found!', 404));
  }

  if( req.user.id.toString() !== quote.createdBy.toString() ) {
    return next(new AppError('You cannot edit this quote!', 403));
  }

  quote.text = req.body.text;
  quote.author = req.body.author;
  await quote.save();

  res.status(200).json({
    success: true,
    message: 'Quote updated!',
    data: quote
  });
});

// @desc     Delete quote
// @route    DELETE /api/v1/quotes/:id
// @access   Private
exports.deleteQuote = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  const quote = await Quote.findById(id);

  if(!quote) {
    return next(new AppError('Quote with this id cannot be found!', 404));
  }

  if( req.user.id.toString() !== quote.createdBy.toString() ) {
    return next(new AppError('You cannot delete this quote!', 403));
  }

  await quote.remove();

  res.status(200).json({
    success: true,
    message: 'Quote deleted!',
    data: quote.toObject({ getters: true })
  });
});