const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ detail: "Missing required fields" });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ detail: "Email already registered" });
    }
    
    // Save image to Base64 (Stateless, Cloud-friendly, and perfect for Serverless!)
    let imageUrl = '';
    if (req.file) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else {
      imageUrl = '/uploads/default.png'; // Fallback path if no image uploaded
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      image_url: imageUrl,
      role: 'user'
    });
    
    await newUser.save();
    console.log(`Successfully registered user: ${normalizedEmail}`);
    
    res.status(200).json({
      message: "User registered successfully",
      user: { name, email: normalizedEmail }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ detail: `Database error: ${error.message}` });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body; // Frontend sends 'username' form key for email
    
    if (!username || !password) {
      return res.status(400).json({ detail: "Missing username or password" });
    }
    
    const normalizedEmail = username.toLowerCase().trim();
    
    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { sub: user.email },
      SECRET_KEY,
      { expiresIn: '30m' }
    );
    
    res.status(200).json({
      access_token: token,
      token_type: "bearer",
      role: user.role || "user",
      user: {
        name: user.name,
        email: user.email,
        image_url: user.image_url || "",
        role: user.role || "user"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ detail: `Server error: ${error.message}` });
  }
};

// Get current user (me)
exports.getMe = async (req, res) => {
  try {
    // User is injected into req by authMiddleware
    res.status(200).json({
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || "user",
      image_url: req.user.image_url || ""
    });
  } catch (error) {
    res.status(500).json({ detail: `Server error: ${error.message}` });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ detail: `Server error: ${error.message}` });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await User.deleteOne({ email: email.toLowerCase().trim() });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    res.status(200).json({ message: `User ${email} deleted successfully` });
  } catch (error) {
    res.status(500).json({ detail: `Server error: ${error.message}` });
  }
};

// Admin: Stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    
    // Simulate active users fluctuation (matching python backend logic)
    const baseActive = Math.floor(totalUsers * 0.6);
    const jitter = Math.floor(totalUsers * 0.05) || 1;
    const randomJitter = Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
    const activeNow = Math.max(0, Math.min(totalUsers, baseActive + randomJitter));
    
    const systemLoad = Math.floor(Math.random() * 35) + 10; // 10-45%
    
    res.status(200).json({
      total_users: totalUsers,
      active_now: activeNow,
      system_load: systemLoad,
      schemes_count: 84,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ detail: `Server error: ${error.message}` });
  }
};
