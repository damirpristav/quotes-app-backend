const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, 'First name is required.']
  },
  lname: {
    type: String,
    required: [true, 'Last name is required.']
  },
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    minlength: [5, 'Username must be at least 5 characters long.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email is invalid.']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    minlength: [6, 'Password must be at least 6 characters long!']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  active: {
    type: Boolean,
    default: false,
    select: false
  },
  activationToken: {
    type: String,
    select: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// MIDDLEWARES
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHODS
userSchema.methods.checkPassword = async function(password) {
  return bcrypt.compare(password, this.password);
}

userSchema.methods.getSignedJWT = function() {
  return jwt.sign({ 
    id: this._id, 
    fname: this.fname,
    lname: this.lname,
    username: this.username,
    email: this.email
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

// VIRTUALS
userSchema.virtual('quotes', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'createdBy',
  justOne: false
});

module.exports = mongoose.model('User', userSchema);