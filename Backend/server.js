const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./Configurations/database");
const mongoose = require("mongoose");

// Import routes
const authRoutes = require("./Routes/authRoutes");
const communityRoutes = require("./Routes/communityRoutes");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
// Connect to MongoDB
connectDB();

// Set up basic security with helmet
app.use(helmet());

// Configure CORS to accept requests from both ports 3000 and 4000
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:4000",
      
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    exposedHeaders: ["x-auth-token"],
  })
);

// Set up request logging
app.use(morgan("dev"));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/community", communityRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Set port
const PORT = process.env.BACKEND_PORT || 8000;

// Start server and connect to database
const startServer = async () => {
  try {
    // Attempt to connect to MongoDB
    await connectDB();
    
    // Start server only after successful database connection
    app.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    // Keep the server running even if database connection fails
    app.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT} (Database connection failed)`
      );
    });
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  // Give the server time to send any pending responses before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
