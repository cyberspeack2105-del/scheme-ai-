const express = require('express');
const multer = require('multer');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Controllers
const authController = require('../controllers/authController');
const aiController = require('../controllers/aiController');
const communityController = require('../controllers/communityController');
const analyticsController = require('../controllers/analyticsController');
const recommendationEngine = require('../data/recommendationEngine');

// Configure Multer for pure in-memory processing (Serverless friendly)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Health check
router.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  let status = "Connected";
  try {
    if (mongoose.connection.readyState !== 1) {
      status = "Connecting/Disconnected";
    }
  } catch (err) {
    status = `Failed: ${err.message}`;
  }
  
  res.status(200).json({
    status: status,
    database_host: process.env.MONGO_URL ? "Atlas Connected" : "Local/Other",
    collection: "users"
  });
});

// Authentication routes
router.post('/register', upload.single('image'), authController.register);
router.post('/login', upload.none(), authController.login);
router.get('/me', authMiddleware, authController.getMe);

// Admin: User operations
router.get('/admin/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.delete('/admin/users/:email', authMiddleware, adminMiddleware, authController.deleteUser);
router.get('/admin/stats', authMiddleware, adminMiddleware, authController.getStats);

// Activity Logging routes
router.post('/activity/log', communityController.logActivity);
router.get('/admin/activity', authMiddleware, adminMiddleware, communityController.getActivityLogs);

// Community feedback routes
router.post('/community/feedback', communityController.submitFeedback);
router.get('/community/feedback', communityController.getFeedback);

// Community reviews routes
router.post('/community/reviews', communityController.submitReview);
router.get('/community/reviews', communityController.getReviews);
router.delete('/community/reviews/:review_id', authMiddleware, communityController.deleteReview);

// Community chat room routes
router.post('/community/chat', communityController.postChatMessage);
router.get('/community/chat', communityController.getChatMessages);

// Admin Analytics routes
router.get('/admin/analytics/schemes', authMiddleware, adminMiddleware, analyticsController.getSchemeAnalytics);
router.get('/admin/analytics/jobs', authMiddleware, adminMiddleware, analyticsController.getJobAnalytics);
router.get('/admin/inventory/jobs', authMiddleware, adminMiddleware, analyticsController.getJobInventory);
router.get('/admin/analytics/usage', authMiddleware, adminMiddleware, analyticsController.getUsageAnalytics);
router.get('/admin/inventory/schemes', authMiddleware, adminMiddleware, analyticsController.getSchemeInventory);

// AI chatbot and data extraction routes
router.post('/chat', aiController.chat);
router.post('/api/analyze-form', aiController.analyzeForm);
router.post('/whatsapp', aiController.whatsappWebhook);

// Recommendation Engine routes
router.post('/recommend', aiController.getAIRecommendations);

router.post('/analyze-skill-gap', async (req, res) => {
  try {
    const { user_skills, target_role } = req.body;
    console.log("[Skill Gap API] Request received:", { user_skills, target_role });
    const results = recommendationEngine.analyzeSkillGap(user_skills, target_role);
    console.log("[Skill Gap API] Response results:", {
      role: results.role,
      matched_count: results.matched_skills ? results.matched_skills.length : 0,
      missing_count: results.missing_skills ? results.missing_skills.length : 0,
      score: results.score
    });
    res.status(200).json(results);
  } catch (error) {
    console.error("[Skill Gap API] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mock Interview Bot routes
router.post('/interview/upload-resume', upload.single('file'), aiController.uploadResume);
router.post('/interview/start', aiController.startInterview);
router.post('/interview/submit', aiController.submitAnswer);

module.exports = router;
