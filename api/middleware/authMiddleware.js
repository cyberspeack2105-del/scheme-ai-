const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    const username = payload.sub; // sub holds the user's email
    if (!username) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    const user = await User.findOne({ email: username });
    if (!user) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ detail: "Could not validate credentials" });
  }
};
