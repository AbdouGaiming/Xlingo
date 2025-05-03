const express = require("express");
const router = express.Router();
const achievementController = require("../Controllers/AchievementController");
const { verifyToken } = require("../Middleware/auth");

// Public routes
router.get("/", achievementController.getAllAchievements);
router.get(
  "/category/:category",
  achievementController.getAchievementsByCategory
);
router.get("/rarity/:rarity", achievementController.getAchievementsByRarity);
router.get(
  "/user/:userId",
  verifyToken,
  achievementController.getUserAchievements
);
router.get("/:id", achievementController.getAchievementById);

// User progress endpoints
router.post(
  "/progress",
  verifyToken,
  achievementController.updateAchievementProgress
);

// Admin routes - typically would have additional middleware for admin verification
router.post("/", verifyToken, achievementController.createAchievement);
router.put("/:id", verifyToken, achievementController.updateAchievement);
router.delete("/:id", verifyToken, achievementController.deleteAchievement);

module.exports = router;
