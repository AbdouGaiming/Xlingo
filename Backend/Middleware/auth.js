const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { validateToken, extractToken } = require("./authValidation");

// Load environment variables
dotenv.config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Extract token from various sources (header, cookie)
  const token = extractToken(req);

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Validate token
  const validationResult = validateToken(token);

  if (!validationResult.isValid) {
    // Handle different validation errors
    if (validationResult.expired) {
      return res
        .status(401)
        .json({ message: "Token has expired", expired: true });
    }

    if (validationResult.accountStatus) {
      return res.status(403).json({
        message: "Account is not active",
        accountStatus: validationResult.accountStatus,
      });
    }

    return res
      .status(401)
      .json({ message: validationResult.error || "Token is not valid" });
  }

  // Add user from payload to request object
  req.user = validationResult.user;
  next();
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authorization denied" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin permissions required" });
  }

  next();
};

// Middleware to verify teacher role
const verifyTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authorization denied" });
  }

  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Teacher permissions required" });
  }

  next();
};

// Middleware to verify active account
const verifyActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authorization denied" });
  }

  if (req.user.accountStatus !== "active") {
    return res.status(403).json({
      message: "Account is not active",
      accountStatus: req.user.accountStatus,
    });
  }

  next();
};

// Middleware to verify email verification
const verifyEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authorization denied" });
  }

  if (!req.user.isVerified) {
    return res
      .status(403)
      .json({ message: "Please verify your email address" });
  }

  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyTeacher,
  verifyActiveAccount,
  verifyEmailVerification,
};
