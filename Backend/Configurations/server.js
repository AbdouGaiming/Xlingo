const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Server configuration
const serverConfig = {
  // Server settings
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || "xlingo_secret_key_development",
    expiresIn: process.env.JWT_EXPIRE || "24h",
  },

  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  },

  // Rate limiting to prevent abuse
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Security settings
  security: {
    bcryptSaltRounds: 10,
    cookieSecure: process.env.NODE_ENV === "production",
    cookieHttpOnly: true,
  },
};

module.exports = serverConfig;
