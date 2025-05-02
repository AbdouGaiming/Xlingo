const express = require("express");
const router = express.Router();
const activityController = require("../Controllers/ActivityController");
const { verifyToken } = require("../Middleware/auth");

// Routes that require authentication
router.get("/user/:userId", verifyToken, activityController.getUserActivities);
router.get(
  "/friends/:userId",
  verifyToken,
  activityController.getFriendActivities
);
router.get(
  "/type/:userId/:type",
  verifyToken,
  activityController.getActivitiesByType
);
router.post("/", verifyToken, activityController.createActivity);
router.delete("/:id", verifyToken, activityController.deleteActivity);

// Leaderboard route
router.get("/leaderboard", activityController.getLeaderboard);

module.exports = router;
