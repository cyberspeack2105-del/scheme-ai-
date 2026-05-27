const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true
  },
  user_image: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
