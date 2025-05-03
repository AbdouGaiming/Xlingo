const User = require("../Models/User");
const UserStats = require("../Models/UserStats");
const Activity = require("../Models/Activity");
const mongoose = require("mongoose");

// Get user progress data
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const userStats = await UserStats.createDailyEntry(userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    res.status(200).json({
      streak: user.streak.count,
      totalXp: user.xp || 0,
      level: user.level || 1,
      dailyGoals: userStats.dailyGoals,
      dailyProgress: userStats.dailyProgress
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching user progress", 
      error: error.message 
    });
  }
};

// Get weekly progress
exports.getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      return res.status(404).json({ message: "User stats not found" });
    }
    
    res.status(200).json({
      weeklyXP: userStats.weeklyXP || []
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching weekly progress", 
      error: error.message 
    });
  }
};

// Update daily progress
exports.updateDailyProgress = async (req, res) => {
  try {
    const { userId, xpEarned, lessonsCompleted, vocabularyLearned } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Ensure user stats exist
    const userStats = await UserStats.createDailyEntry(userId);
    
    // Update fields that were provided
    if (xpEarned) {
      userStats.dailyProgress.xpEarned += xpEarned;
      
      // Update weekly XP for the current day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find today's entry in weekly XP
      const todayIndex = userStats.weeklyXP.findIndex(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === today.getTime();
      });
      
      if (todayIndex !== -1) {
        userStats.weeklyXP[todayIndex].xp += xpEarned;
      }
    }
    
    if (lessonsCompleted) {
      userStats.dailyProgress.lessonsCompleted += lessonsCompleted;
    }
    
    if (vocabularyLearned) {
      userStats.dailyProgress.vocabularyLearned += vocabularyLearned;
    }
    
    await userStats.save();
    
    // Update user's streak if they've met their daily goal
    if (userStats.dailyProgress.xpEarned >= userStats.dailyGoals.xpTarget) {
      const user = await User.findById(userId);
      if (user) {
        await user.updateStreak();
      }
    }
    
    res.status(200).json(userStats);
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating daily progress", 
      error: error.message 
    });
  }
};

// Update daily goals
exports.updateDailyGoals = async (req, res) => {
  try {
    const { userId, xpTarget, lessonsTarget, vocabularyTarget } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      return res.status(404).json({ message: "User stats not found" });
    }
    
    if (xpTarget) userStats.dailyGoals.xpTarget = xpTarget;
    if (lessonsTarget) userStats.dailyGoals.lessonsTarget = lessonsTarget;
    if (vocabularyTarget) userStats.dailyGoals.vocabularyTarget = vocabularyTarget;
    
    await userStats.save();
    
    res.status(200).json(userStats);
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating daily goals", 
      error: error.message 
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { userId, limit = 10, friendsOnly = false } = req.query;
    
    let query = {};
    
    // Only filter by friends if friendsOnly is true and userId is valid
    if (friendsOnly === 'true' && userId && userId !== 'null' && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(new mongoose.Types.ObjectId(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Include both friends and the current user in the leaderboard
      const friendIds = user.friends.map(friend => friend.userId);
      friendIds.push(new mongoose.Types.ObjectId(userId)); // Add current user
      query._id = { $in: friendIds };
    }
    
    const leaderboard = await User.find(query)
      .select('username xp streak.count profileImage')
      .sort('-xp')
      .limit(parseInt(limit));
      
    const rankings = leaderboard.map(user => ({
      _id: user._id,
      username: user.username,
      totalXp: user.xp || 0,
      streak: user.streak?.count || 0,
      profileImage: user.profileImage,
      isCurrentUser: userId && userId !== 'null' && mongoose.Types.ObjectId.isValid(userId) ? 
                     user._id.toString() === userId : false
    }));
    
    res.status(200).json({ rankings });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ 
      message: "Error fetching leaderboard", 
      error: error.message 
    });
  }
};