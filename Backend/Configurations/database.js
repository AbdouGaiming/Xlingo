const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment variables
// Try to use MONGODB_URI first, if not available, use MONGODB_URI_ATLAS as fallback
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_ATLAS;

// Database connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

/**
 * Connect to MongoDB database
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MongoDB connection string is not defined in environment variables"
      );
    }

    const connection = await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB connected: ${connection.connection.host}`);

    // Handle MongoDB connection events
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.info("MongoDB reconnected");
    });

    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
