const express = require("express");
const router = express.Router();
const userStatsController = require("../Controllers/UserStatsController");
const { verifyToken } = require("../Middleware/auth");

// Get user progress data (streak, XP, daily goals)
router.get("/progress/:userId", verifyToken, userStatsController.getUserProgress);

// Get weekly progress data
router.get("/weekly/:userId", verifyToken, userStatsController.getWeeklyProgress);

// Update daily progress
router.post("/progress", verifyToken, userStatsController.updateDailyProgress);

// Update daily goals
router.post("/goals", verifyToken, userStatsController.updateDailyGoals);

// Get leaderboard
router.get("/leaderboard", userStatsController.getLeaderboard);

module.exports = router;