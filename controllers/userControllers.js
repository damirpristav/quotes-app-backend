const crypto = require('crypto');
const handleAsync = require('../utils/handleAsync');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const Email = require('../utils/Email');

// @desc     Register
// @route    POST /api/v1/users/register
// @access   Public
exports.register = handleAsync(async (req, res, next) => {
  const { fname, lname, username, email, password, confirmPassword} = req.body;

  if( password !== confirmPassword ) {
    return next(new AppError('Passwords are not equal!', 400));
  }

  const existingEmailUser = await User.findOne({ email });
  if( existingEmailUser ) {
    return next(new AppError('Email already in use. Please use a different email!', 400));
  }

  const existingUsernameUser = await User.findOne({ username });
  if( existingUsernameUser ) {
    return next(new AppError('This username is taken. Choose another username!', 400));
  }

  const activationToken = crypto.randomBytes(20).toString('hex');

  const user = await User.create({
    fname,
    lname,
    username,
    email,
    password,
    activationToken: crypto.createHash('sha256').update(activationToken).digest('hex')
  });

  if(!user) {
    return next(new AppError('Something went wrong! Please try again later!', 500));
  }

  try {
    const emailForUser = new Email(user, `${process.env.FRONTEND_URL}/verifyUser/${activationToken}`);
    if(emailForUser.send('activateAccount', 'Activate your account')) {
      res.status(200).json({
        success: true,
        message: 'Registration completed! Please check your email to activate your account!',
        data: {
          id: user.id,
          email: user.email,
          fname: user.fname,
          lname: user.lname,
          username: user.username
        }
      });
    }
  }catch(err) {
    return next(new AppError('There was an error sending the email. Please try again!', 500));
  }
}); 

// @desc     Activate Account
// @route    GET /api/v1/users/activateAccount/:token
// @access   Public
exports.activateAccount = handleAsync(async (req, res, next) => {
  const { token } = req.params;
  const activationToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ activationToken });

  if(!user) {
    return next(new AppError('Invalid activation token!', 400));
  }

  user.active = true;
  user.activationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User activated! You can now login to your account.',
    data: null
  });
});

// @desc     Login User
// @route    POST /api/v1/users/login
// @access   Public
exports.login = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return next(new AppError('Email and password fields are required.', 400));
  }

  const user = await User.findOne({ email }).select('+password +active');

  if(!user) {
    return next(new AppError('Invalid credentials!', 401));
  }

  const passCheck = await user.checkPassword(password);

  if(!passCheck) {
    return next(new AppError('Invalid credentials', 401));
  }

  if(!user.active) {
    return next(new AppError('User is not active. Please activate your account and try again.', 400));
  }

  tokenResponse(user, res);
});

// @desc     Get logged in user data
// @route    GET /api/v1/users/me
// @access   Private
exports.me = handleAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged in user data',
    data: req.user.toObject({ getters: true })
  })
});

// @desc     Get user by username
// @route    GET /api/v1/users/:username
// @access   Public
exports.getUserByUsername = handleAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).populate('quotes');

  if(!user) {
    return next(new AppError('User not found!', 404));
  }

  res.status(200).json({
    success: true,
    data: user.toObject({ getters: true })
  })
});

// @desc     Update by id
// @route    PATCH /api/v1/users/:id
// @access   Private
exports.updateUser = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select('+password');

  if(!user) {
    return next(new AppError('User not found!', 404));
  }

  if(user.id !== req.user.id) {
    return next(new AppError('You are not authorized to update this user!', 403));
  }

  const { oldPassword, newPassword } = req.body;
  const isPasswordVerfied = await user.checkPassword(oldPassword);

  if(!isPasswordVerfied) {
    return next(new AppError('Incorrect password!', 400));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: `Password updated!`,
    data: null
  })
});

// @desc     Delete user by id
// @route    DELETE /api/v1/users/:id
// @access   Private
exports.deleteUser = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if(!user) {
    return next(new AppError('User not found!', 404));
  }

  if(user.id !== req.user.id) {
    return next(new AppError('You are not authorized to delete this user!', 403));
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: `User ${user.fname} deleted!`,
    data: null
  })
});

// Token response
const tokenResponse = (user, res) => {
  const token = user.getSignedJWT();

  res.status(200).json({
    success: true,
    message: 'Login successfull!',
    data: token
  });
}