const Activity = require("../Models/Activity");
const mongoose = require("mongoose");

// Get all activities for a user
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const activities = await Activity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50) // Limit to most recent 50 activities
      .populate("details.lessonId")
      .populate("details.achievementId");

    res.status(200).json(activities);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching user activities",
        error: error.message,
      });
  }
};

// Get recent activities for user's friends
exports.getFriendActivities = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // First, get the user to find their friends list
    const User = require("../Models/User");
    const currentUser = await User.findById(userId).select("friends");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get friend IDs
    const friendIds = currentUser.friends || [];

    // Get activities from friends that have visibility set to 'public' or 'friends'
    const friendActivities = await Activity.find({
      userId: { $in: friendIds },
      visibility: { $in: ["public", "friends"] },
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("userId", "username avatar")
      .populate("details.lessonId")
      .populate("details.achievementId");

    res.status(200).json(friendActivities);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching friend activities",
        error: error.message,
      });
  }
};

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    const savedActivity = await newActivity.save();
    
    const User = require("../Models/User");
    const userId = req.body.userId;

    // Check if this is an achievement activity and update user XP if needed
    if (
      req.body.type === "achievement_earned" &&
      req.body.details.achievementId
    ) {
      const Achievement = require("../Models/Achievement");
      const achievement = await Achievement.findById(
        req.body.details.achievementId
      );

      if (achievement && achievement.xpReward > 0) {
        await User.findByIdAndUpdate(userId, {
          $inc: { xp: achievement.xpReward },
        });
      }
    }
    
    // Update user streak whenever they complete a lesson
    if (req.body.type === "lesson_complete") {
      // Find the user
      const user = await User.findById(userId);
      if (user) {
        // Call the updateStreak method defined in the User model
        await user.updateStreak();
        
        // Check if user has hit a streak milestone (7, 14, 21, 30 days)
        const milestones = [7, 14, 21, 30, 60, 90, 180, 365];
        if (milestones.includes(user.streak.count)) {
          // Create a streak milestone activity
          const streakActivity = new Activity({
            userId: user._id,
            type: "streak_milestone",
            details: {
              streakCount: user.streak.count,
              xpEarned: user.streak.count * 10, // 10 XP per day in streak
            },
            timestamp: new Date(),
            visibility: "public",
          });
          await streakActivity.save();
          
          // Award XP for the streak milestone
          await User.findByIdAndUpdate(userId, {
            $inc: { xp: user.streak.count * 10 },
          });
        }
      }
    }

    res.status(201).json(savedActivity);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating activity", error: error.message });
  }
};

// Get activities by type
exports.getActivitiesByType = async (req, res) => {
  try {
    const { userId, type } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const activities = await Activity.find({
      userId,
      type,
    })
      .sort({ timestamp: -1 })
      .populate("details.lessonId")
      .populate("details.achievementId");

    res.status(200).json(activities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching activities", error: error.message });
  }
};

// Delete an activity (admin only or owner)
exports.deleteActivity = async (req, res) => {
  try {
    const deletedActivity = await Activity.findByIdAndDelete(req.params.id);
    if (!deletedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting activity", error: error.message });
  }
};

// Get leaderboard data (top users by XP)
exports.getLeaderboard = async (req, res) => {
  try {
    const User = require("../Models/User");
    const leaderboard = await User.find()
      .select("username avatar xp")
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json(leaderboard);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leaderboard", error: error.message });
  }
};
