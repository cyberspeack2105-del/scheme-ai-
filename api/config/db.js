const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use only the MongoDB Atlas URL directly as requested
    const mongoUrl = 'mongodb+srv://raju:kanthalloor123@cluster0.dsttruk.mongodb.net/kanthalloor_db?appName=Cluster0';

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
