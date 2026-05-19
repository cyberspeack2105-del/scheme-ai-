const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load Environment variables FIRST!
dotenv.config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Enable CORS for React frontend (Vite local and Vercel domains)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://rootnexus.vercel.app",
    "https://secure-data-collection-portal-with-ai-scheme-recommadation-system.vercel.app",
    "https://secure-data-collection-portal-with-ai.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Standard Express Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local static uploads if running locally (fallback)
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB Database
connectDB().catch(err => {
  console.error("Database connection initialization failed:", err);
});

// Root check route
app.get('/api', (req, res) => {
  res.status(200).json({ message: "Root Nexus Scheme Recommendation API is running successfully!" });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: "Root Nexus API Gateway Active" });
});

// Register unified apiRoutes
app.use('/api', apiRoutes);
app.use('/', apiRoutes); // Backwards compatibility for exact root calls like /register

// For Local execution (Vercel bypasses this block during hosting)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000; // Run on 8000 to match your current FastAPI port, or 5000!
  app.listen(PORT, () => {
    console.log(`[Server] Express running locally in dev mode on http://localhost:${PORT}`);
  });
}

// Export Express App for Vercel Serverless Lambdas
module.exports = app;
