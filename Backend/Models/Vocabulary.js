const mongoose = require("mongoose");

const vocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
  },
  translation: {
    type: String,
    required: true,
    trim: true,
  },
  languageId: {
    type: String,
    required: true,
    trim: true,
  },
  categoryId: {
    type: String,
    required: true,
    trim: true,
  },
  example: {
    type: String,
    trim: true,
  },
  hint: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: Number,
    default: 1, // 1-5 difficulty rating
    min: 1,
    max: 5,
  },
  imageUrl: {
    type: String,
    trim: true,
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

// Index for efficient queries by language and category
vocabularySchema.index({ languageId: 1, categoryId: 1 });

const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);

module.exports = Vocabulary;
