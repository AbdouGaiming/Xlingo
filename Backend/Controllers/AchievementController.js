const Achievement = require("../Models/Achievement");
const mongoose = require("mongoose");

// Get all achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.status(200).json(achievements);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching achievements", error: error.message });
  }
};

// Get achievement by ID
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }
    res.status(200).json(achievement);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching achievement", error: error.message });
  }
};

// Get achievements by category
exports.getAchievementsByCategory = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      category: req.params.category,
    });
    res.status(200).json(achievements);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching achievements", error: error.message });
  }
};

// Get achievements by rarity
exports.getAchievementsByRarity = async (req, res) => {
  try {
    const achievements = await Achievement.find({ rarity: req.params.rarity });
    res.status(200).json(achievements);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching achievements", error: error.message });
  }
};

// Get user's achievements
exports.getUserAchievements = async (req, res) => {
  try {
    console.log("Getting achievements for user:", req.params.userId);

    // Get user ID from request parameters
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID format:", userId);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // First, get all achievements
    const allAchievements = await Achievement.find();
    console.log(`Found ${allAchievements.length} total achievements`);

    // Then, find all achievement activities for this user
    const Activity = require("../Models/Activity");
    const userAchievementActivities = await Activity.find({
      userId: userId,
      type: "achievement_earned",
    }).populate("details.achievementId");

    console.log(
      `Found ${userAchievementActivities.length} achievement activities for user ${userId}`
    );

    // Extract the achievement IDs from activities
    const earnedAchievementIds = userAchievementActivities
      .map((activity) => {
        if (activity.details && activity.details.achievementId) {
          const idStr = activity.details.achievementId.toString();
          console.log("Found earned achievement:", idStr);
          return idStr;
        }
        return null;
      })
      .filter(Boolean); // Filter out any undefined or null values

    console.log(
      `User ${userId} has earned ${earnedAchievementIds.length} achievements`
    );

    if (earnedAchievementIds.length > 0) {
      console.log("Sample earned achievement ID:", earnedAchievementIds[0]);
    }

    // Add an 'isCompleted' flag to each achievement
    const enrichedAchievements = allAchievements.map((achievement) => {
      const achievementObj = achievement.toObject();
      const isCompleted = earnedAchievementIds.some(
        (id) => id === achievement._id.toString()
      );
      achievementObj.isCompleted = isCompleted;

      if (isCompleted) {
        console.log(`Achievement ${achievement.name} marked as completed`);
      }

      return achievementObj;
    });

    console.log(
      `Returning ${enrichedAchievements.length} achievements to client`
    );
    res.status(200).json(enrichedAchievements);
  } catch (error) {
    console.error("Error in getUserAchievements:", error);
    res.status(500).json({
      message: "Error fetching user achievements",
      error: error.message,
    });
  }
};

// Create new achievement (admin only)
exports.createAchievement = async (req, res) => {
  try {
    const newAchievement = new Achievement(req.body);
    const savedAchievement = await newAchievement.save();
    res.status(201).json(savedAchievement);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating achievement", error: error.message });
  }
};

// Update achievement (admin only)
exports.updateAchievement = async (req, res) => {
  try {
    const updatedAchievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAchievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }
    res.status(200).json(updatedAchievement);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating achievement", error: error.message });
  }
};

// Delete achievement (admin only)
exports.deleteAchievement = async (req, res) => {
  try {
    const deletedAchievement = await Achievement.findByIdAndDelete(
      req.params.id
    );
    if (!deletedAchievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }
    res.status(200).json({ message: "Achievement deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting achievement", error: error.message });
  }
};

// Update achievement progress
exports.updateAchievementProgress = async (req, res) => {
  try {
    const { userId, achievementId, progress, currentValue } = req.body;
    
    // Validate userId and achievementId
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(achievementId)) {
      return res.status(400).json({ message: "Invalid user ID or achievement ID format" });
    }
    
    // Get the achievement to know the target value
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }
    
    const targetValue = achievement.requirements.value;
    
    // Calculate if the achievement is completed
    const isCompleted = currentValue >= targetValue;
    
    // Record progress through an activity
    const Activity = require("../Models/Activity");
    
    // Check if the achievement is already completed
    const existingActivity = await Activity.findOne({
      userId,
      type: "achievement_earned",
      "details.achievementId": achievementId
    });
    
    if (existingActivity) {
      return res.status(200).json({
        message: "Achievement already completed",
        achievement
      });
    }
    
    // If the achievement is now completed, create an activity
    if (isCompleted) {
      const newActivity = new Activity({
        userId,
        type: "achievement_earned",
        details: {
          achievementId,
          name: achievement.name,
          xpEarned: achievement.xpReward
        }
      });
      
      await newActivity.save();
      
      // Award XP to the user
      const User = require("../Models/User");
      if (achievement.xpReward > 0) {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'learningProgress.0.xp': achievement.xpReward }
        });
      }
      
      return res.status(200).json({
        message: "Achievement completed!",
        achievement,
        xpAwarded: achievement.xpReward
      });
    }
    
    // Achievement not completed yet, return progress info
    return res.status(200).json({
      message: "Achievement progress updated",
      achievement,
      progress: {
        current: currentValue,
        target: targetValue,
        percentage: Math.min((currentValue / targetValue) * 100, 100)
      }
    });
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    res.status(500).json({
      message: "Error updating achievement progress",
      error: error.message
    });
  }
};
