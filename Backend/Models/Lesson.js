const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["vocabulary", "grammar", "pronunciation", "conversation"],
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    xpReward: {
      type: Number,
      required: true,
      default: 10,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson"
    }],
    order: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: Number, // in minutes
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
lessonSchema.index({ language: 1, type: 1, order: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;