const Review = require('../models/Review');
const Feedback = require('../models/Feedback');
const ChatMessage = require('../models/ChatMessage');
const ActivityLog = require('../models/ActivityLog');

// Activity Logging
exports.logActivity = async (req, res) => {
  try {
    const { user_email, action, target } = req.body;
    const log = new ActivityLog({
      user_email,
      action,
      target,
      timestamp: new Date().toISOString()
    });
    await log.save();
    res.status(200).json({ status: "logged" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ _id: -1 }).limit(20);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const fb = new Feedback({
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    });
    await fb.save();
    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const fbs = await Feedback.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(fbs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reviews
exports.submitReview = async (req, res) => {
  try {
    const { user_name, user_email, user_image, role, rating, comment } = req.body;
    const review = new Review({
      user_name,
      user_email,
      user_image,
      role,
      rating,
      comment,
      timestamp: new Date().toISOString()
    });
    await review.save();

    // Log this activity silently
    try {
      const log = new ActivityLog({
        user_email: "system",
        action: "POSTED_REVIEW",
        target: `Rated ${rating} stars`,
        timestamp: new Date().toISOString()
      });
      await log.save();
    } catch (e) {
      // Ignore background log errors
    }

    res.status(200).json({ message: "Review submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ timestamp: -1 }).limit(50);
    // Format _id to string for compatibility with frontend expectations
    const formatted = reviews.map(r => {
      const obj = r.toObject();
      obj._id = obj._id.toString();
      return obj;
    });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const review = await Review.findById(review_id);
    if (!review) {
      return res.status(404).json({ detail: "Review not found" });
    }

    // Check ownership or admin role
    if (review.user_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized to delete this review" });
    }

    await Review.deleteOne({ _id: review_id });
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ detail: "Invalid review ID" });
  }
};

// Chat Room
exports.postChatMessage = async (req, res) => {
  try {
    const { user_name, user_image, message, role } = req.body;
    const msg = new ChatMessage({
      user_name,
      user_image,
      message,
      role,
      timestamp: new Date().toISOString()
    });
    await msg.save();
    res.status(200).json({ status: "sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const msgs = await ChatMessage.find().sort({ timestamp: 1 }).limit(50);
    res.status(200).json(msgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
