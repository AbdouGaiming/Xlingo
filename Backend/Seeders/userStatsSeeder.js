const mongoose = require("mongoose");
const User = require("../Models/User");
const UserStats = require("../Models/UserStats");
const connectDB = require("../Configurations/database");

async function seedUserStats() {
  try {
    console.log("Starting user stats seeding...");
    
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await connectDB();
      console.log("Connected to database for seeding");
    }
    
    // Find all users
    const users = await User.find();
    console.log(`Found ${users.length} users for stats seeding`);
    
    if (users.length === 0) {
      console.log("No users found, nothing to seed");
      return;
    }
    
    // Create stats for each user
    const userStatsData = [];
    
    for (const user of users) {
      console.log(`Creating stats for user: ${user.username} (${user._id})`);
      
      // Check if user already has stats
      const existingStats = await UserStats.findOne({ userId: user._id });
      
      if (existingStats) {
        console.log(`User ${user.username} already has stats, updating...`);
        
        // Update weekly XP with random data
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyXP = [];
        
        const today = new Date();
        const currentDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0 = Sunday, 1 = Monday
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - currentDayIdx + i);
          date.setHours(0, 0, 0, 0);
          
          weeklyXP.push({
            day: days[i],
            xp: i <= currentDayIdx ? Math.floor(Math.random() * 50) + 5 : 0,
            date
          });
        }
        
        // Update existing stats
        existingStats.dailyGoals = {
          xpTarget: 30,
          lessonsTarget: 2,
          vocabularyTarget: 10
        };
        
        existingStats.dailyProgress = {
          date: new Date(),
          xpEarned: Math.floor(Math.random() * 40),
          lessonsCompleted: Math.floor(Math.random() * 3),
          vocabularyLearned: Math.floor(Math.random() * 15)
        };
        
        existingStats.weeklyXP = weeklyXP;
        
        await existingStats.save();
        console.log(`Updated stats for user ${user.username}`);
      } else {
        console.log(`Creating new stats for user ${user.username}`);
        
        // Generate weekly XP data
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyXP = [];
        
        const today = new Date();
        const currentDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0 = Sunday, 1 = Monday
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - currentDayIdx + i);
          date.setHours(0, 0, 0, 0);
          
          weeklyXP.push({
            day: days[i],
            xp: i <= currentDayIdx ? Math.floor(Math.random() * 50) + 5 : 0,
            date
          });
        }
        
        // Create random streak history (last 10 days)
        const streakHistory = [];
        for (let i = 10; i > 0; i--) {
          const historyDate = new Date(today);
          historyDate.setDate(today.getDate() - i);
          historyDate.setHours(0, 0, 0, 0);
          
          // Skip some days randomly to create breaks in the streak
          if (Math.random() > 0.8) continue;
          
          streakHistory.push({
            date: historyDate,
            xpEarned: Math.floor(Math.random() * 50) + 10,
            goalsCompleted: Math.floor(Math.random() * 3)
          });
        }
        
        // Create new user stats
        const newUserStats = new UserStats({
          userId: user._id,
          dailyGoals: {
            xpTarget: 30,
            lessonsTarget: 2,
            vocabularyTarget: 10
          },
          dailyProgress: {
            date: new Date(),
            xpEarned: Math.floor(Math.random() * 40),
            lessonsCompleted: Math.floor(Math.random() * 3),
            vocabularyLearned: Math.floor(Math.random() * 15)
          },
          streakHistory,
          longestStreak: Math.floor(Math.random() * 10) + 1,
          totalXpEarned: user.learningProgress && user.learningProgress.length > 0 
            ? user.learningProgress[0].xp || Math.floor(Math.random() * 500) + 50
            : Math.floor(Math.random() * 500) + 50,
          weeklyXP
        });
        
        userStatsData.push(newUserStats);
      }
    }
    
    // Save all new user stats in bulk
    if (userStatsData.length > 0) {
      await UserStats.insertMany(userStatsData);
      console.log(`Created stats for ${userStatsData.length} users`);
    }
    
    console.log("User stats seeding completed successfully");
  } catch (error) {
    console.error("Error seeding user stats:", error);
  }
}

// Run seeder directly if script is executed directly
if (require.main === module) {
  seedUserStats()
    .then(() => {
      console.log("User stats seeding completed");
      setTimeout(() => process.exit(0), 1000);
    })
    .catch(error => {
      console.error("User stats seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedUserStats;