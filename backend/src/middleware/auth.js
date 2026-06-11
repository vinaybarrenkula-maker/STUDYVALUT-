const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token from either:
 *  1. HTTP-only cookie (`token`)
 *  2. Authorization header (`Bearer <token>`)
 *
 * Attaches the authenticated user to `req.user`.
 */
const verifyToken = async (req, res, next) => {
  let token;

  // 1. Try cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Fallback to Authorization header
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
