const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-93afc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      }
    );

    console.log('MongoDB connected...');
  } catch (err) {
    console.log('MongoDB connection failed! Error: ' + err.message);
  }
} 