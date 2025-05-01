const { check } = require("express-validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Registration request validation
exports.registerValidation = [
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Login request validation
exports.loginValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  check("password").notEmpty().withMessage("Password is required"),
];

// Forgot password validation
exports.forgotPasswordValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
];

// Reset password validation
exports.resetPasswordValidation = [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// Change password validation
exports.changePasswordValidation = [
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password cannot be the same as current password");
      }
      return true;
    }),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// Token validation function (for server-side)
exports.validateToken = (token) => {
  if (!token) {
    return { isValid: false, error: "No token provided" };
  }

  try {
    // Get JWT secret from environment variable or use a default (for development only)
    const JWT_SECRET =
      process.env.JWT_SECRET || "xlingo_secret_key_development";

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token has expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return { isValid: false, error: "Token has expired", expired: true };
    }

    // Check if user account is active
    if (decoded.user && decoded.user.accountStatus !== "active") {
      return {
        isValid: false,
        error: "Account is not active",
        accountStatus: decoded.user.accountStatus,
      };
    }

    return { isValid: true, user: decoded.user };
  } catch (error) {
    return { isValid: false, error: error.message || "Invalid token" };
  }
};

// Token extraction from request
exports.extractToken = (req) => {
  // First check authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Then check x-auth-token header
  const token = req.header("x-auth-token");
  if (token) {
    return token;
  }

  // Finally check cookie if available
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // No token found
  return null;
};
