const express = require("express");
const router = express.Router();
const { verifyToken } = require("../Middleware/auth");
const communityController = require("../Controllers/CommunityController");

// Friend management routes
router.get("/friends", verifyToken, communityController.getFriends);
router.get("/friends/requests", verifyToken, communityController.getFriendRequests);
router.post("/friends/request", verifyToken, communityController.sendFriendRequest);
router.put("/friends/accept/:requestId", verifyToken, communityController.acceptFriendRequest);
router.put("/friends/reject/:requestId", verifyToken, communityController.rejectFriendRequest);
router.delete("/friends/cancel/:requestId", verifyToken, communityController.cancelFriendRequest);
router.delete("/friends/:friendId", verifyToken, communityController.removeFriend);

// User search route
router.get("/users/search", verifyToken, communityController.searchUsers);

// Friend profile route
router.get("/profile/:friendId", verifyToken, communityController.getFriendProfile);

// Leaderboard route
router.get("/leaderboard", verifyToken, communityController.getFriendLeaderboard);

// Activity feed route
router.get("/activity", verifyToken, communityController.getFriendActivity);

module.exports = router;