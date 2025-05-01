const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// Load configurations
const connectDB = require("./Configurations/database");
const serverConfig = require("./Configurations/server");

// Import routes
const authRoutes = require("./Routes/authRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors(serverConfig.cors)); // CORS configuration
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Request logging in development mode
if (serverConfig.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit(serverConfig.rateLimit);
app.use("/api/", limiter);

// Routes
app.use("/api/auth", authRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Xlingo API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: serverConfig.nodeEnv === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = serverConfig.port;
app.listen(PORT, () => {
  console.log(`Server running in ${serverConfig.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Don't crash the server in production, but log the error
  if (serverConfig.nodeEnv === "development") {
    process.exit(1);
  }
});

module.exports = app;
