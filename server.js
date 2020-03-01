const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const app = express();
const connectToDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// connect to database
connectToDB();

// body parser
app.use(express.json());

// cors
app.use(cors({ origin: process.env.ORIGIN }));
// app.use(cors());

// helmet - adds some http headers
app.use(helmet());

// Prevents XSS attacks
app.use(xss());

// Prevents http param pollution
app.use(hpp());

// Sanitizes data
app.use(mongoSanitize());

// get routes
const userRoutes = require('./routes/userRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

// use routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/quotes', quoteRoutes);

// use error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});