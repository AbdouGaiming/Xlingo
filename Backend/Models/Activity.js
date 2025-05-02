const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "lesson_complete",
        "achievement_earned",
        "streak_milestone",
        "level_up",
        "friend_added",
        "language_started"
      ],
      required: true,
    },
    details: {
      lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
      achievementId: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
      language: String,
      streakCount: Number,
      level: Number,
      xpEarned: Number,
      friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "friends"
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying of recent activities
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ "details.friendId": 1, timestamp: -1 });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;