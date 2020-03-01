const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Quote Text is required!'],
    minlength: [10, 'Quote Text must be at least 10 characters long']
  },
  author: {
    type: String,
    required: [true, 'Quote Author is required!']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required!']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Quote', quoteSchema);