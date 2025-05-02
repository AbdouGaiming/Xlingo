const mongoose = require("mongoose");

const userVocabularySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vocabularyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vocabulary",
    required: true,
  },
  status: {
    type: String,
    enum: ["new", "learning", "known", "mastered"],
    default: "new",
  },
  timesReviewed: {
    type: Number,
    default: 0,
  },
  timesCorrect: {
    type: Number,
    default: 0,
  },
  lastReviewed: {
    type: Date,
    default: null,
  },
  nextReviewDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for efficient queries
userVocabularySchema.index({ userId: 1, vocabularyId: 1 }, { unique: true });

const UserVocabulary = mongoose.model("UserVocabulary", userVocabularySchema);

module.exports = UserVocabulary;
