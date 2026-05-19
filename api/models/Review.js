const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true
  },
  user_email: {
    type: String,
    default: ''
  },
  user_image: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
