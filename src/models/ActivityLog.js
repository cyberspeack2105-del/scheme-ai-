const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
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

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
