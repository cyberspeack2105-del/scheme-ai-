const ActivityLog = require('../models/ActivityLog');
const schemesData = require('../data/schemes.json');
const jobsData = require('../data/jobs.json');

// Schemes Analytics Aggregation
exports.getSchemeAnalytics = async (req, res) => {
  try {
    const results = await ActivityLog.aggregate([
      { $match: { action: { $in: ["VIEWED_DETAILS", "APPLIED_SCHEME"] } } },
      { $group: { _id: "$target", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    if (results.length === 0) {
      // Return simulated backup if database has no active logs yet
      const fallback = [
        { name: "Pradhan Mantri Jan Dhan Yojana", value: Math.floor(Math.random() * 45) + 5 },
        { name: "Ayushman Bharat Yojana", value: Math.floor(Math.random() * 45) + 5 },
        { name: "PM Kisan Samman Nidhi", value: Math.floor(Math.random() * 45) + 5 },
        { name: "PM Awas Yojana Rural", value: Math.floor(Math.random() * 45) + 5 },
        { name: "MGNREGA", value: Math.floor(Math.random() * 45) + 5 }
      ];
      return res.status(200).json(fallback);
    }

    res.status(200).json(results.map(r => ({ name: r._id, value: r.count })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jobs Analytics Aggregation
exports.getJobAnalytics = async (req, res) => {
  try {
    const results = await ActivityLog.aggregate([
      { $match: { action: "VISITED_JOB_PORTAL" } },
      { $group: { _id: "$target", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    if (results.length === 0) {
      const fallback = [
        { name: "Naukri.com", value: Math.floor(Math.random() * 45) + 5 },
        { name: "Indeed India", value: Math.floor(Math.random() * 45) + 5 },
        { name: "LinkedIn Jobs", value: Math.floor(Math.random() * 45) + 5 },
        { name: "Monster India", value: Math.floor(Math.random() * 45) + 5 },
        { name: "Internshala", value: Math.floor(Math.random() * 45) + 5 }
      ];
      return res.status(200).json(fallback);
    }

    res.status(200).json(results.map(r => ({ name: r._id, value: r.count })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Job Inventory from JSON file
exports.getJobInventory = async (req, res) => {
  try {
    res.status(200).json(jobsData);
  } catch (error) {
    res.status(500).json({ detail: "Failed to load job inventory" });
  }
};

// Scheme Inventory from JSON file
exports.getSchemeInventory = async (req, res) => {
  try {
    res.status(200).json(schemesData);
  } catch (error) {
    res.status(500).json({ detail: "Failed to load scheme inventory" });
  }
};

// Usage Statistics
exports.getUsageAnalytics = async (req, res) => {
  try {
    const usageData = [];
    const baseUsers = 100;
    
    // Generate 7 days of charts
    for (let i = 7; i > 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      usageData.push({
        name: dateString,
        usage: baseUsers + Math.floor(Math.random() * 180) + 20,
        rating: parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)) // 4.0 - 5.0 rating
      });
    }
    
    res.status(200).json(usageData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
