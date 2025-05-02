const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["learning", "social", "streak", "milestone"],
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    requirements: {
      type: {
        type: String,
        enum: ["lesson_count", "streak_days", "friend_count", "xp_total", "languages_count"],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      language: String, // Optional, for language-specific achievements
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      required: true,
    },
    isSecret: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient querying of achievements by category and rarity
achievementSchema.index({ category: 1, rarity: 1 });

// Create Achievement model
const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = Achievement;