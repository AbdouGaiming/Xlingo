const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin permissions required' });
  }

  next();
};

// Middleware to verify teacher role
const verifyTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Teacher permissions required' });
  }

  next();
};

// Middleware to verify active account
const verifyActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({ 
      message: 'Account is not active',
      accountStatus: req.user.accountStatus 
    });
  }

  next();
};

// Middleware to verify email verification
const verifyEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email address' });
  }

  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyTeacher,
  verifyActiveAccount,
  verifyEmailVerification
};