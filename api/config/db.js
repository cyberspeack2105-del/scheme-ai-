const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL || 'mongodb://localhost:27017/auth_db';
    
    // Inject DB_NAME if specified and not already in connection string
    if (process.env.DB_NAME) {
      const dbName = process.env.DB_NAME;
      if (mongoUrl.includes('mongodb+srv://')) {
        // If it ends with '/' or has '?' we need to insert DB_NAME before '?'
        if (mongoUrl.includes('?')) {
          // Check if DB_NAME is already there, if not insert it
          const urlParts = mongoUrl.split('?');
          if (!urlParts[0].endsWith(`/${dbName}`)) {
            if (urlParts[0].endsWith('/')) {
              urlParts[0] = urlParts[0] + dbName;
            } else {
              urlParts[0] = urlParts[0] + '/' + dbName;
            }
            mongoUrl = urlParts.join('?');
          }
        } else {
          if (!mongoUrl.endsWith(`/${dbName}`)) {
            if (mongoUrl.endsWith('/')) {
              mongoUrl = mongoUrl + dbName;
            } else {
              mongoUrl = mongoUrl + '/' + dbName;
            }
          }
        }
      }
    }

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
