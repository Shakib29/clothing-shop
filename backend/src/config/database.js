const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    console.log('Attempting MongoDB connection...');

    const conn = await mongoose.connect(mongoUri);

    console.log('MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;