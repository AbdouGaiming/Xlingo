const express = require("express");
const router = express.Router();
const vocabularyController = require("../Controllers/VocabularyController");
const { verifyToken } = require("../Middleware/auth");

// Get random vocabulary - no authentication required
router.get("/random", vocabularyController.getRandomVocabulary);

// Get vocabulary categories - no authentication required
router.get("/categories", vocabularyController.getCategories);

// Get user vocabulary progress (requires authentication)
router.get("/progress", verifyToken, vocabularyController.getUserProgress);

// Update user vocabulary progress (requires authentication)
router.post("/progress", verifyToken, vocabularyController.updateUserProgress);

// Add new vocabulary (admin only in the future)
router.post("/add", vocabularyController.addVocabulary);

module.exports = router;
