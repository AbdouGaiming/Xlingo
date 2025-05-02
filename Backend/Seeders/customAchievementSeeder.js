const mongoose = require("mongoose");
const Achievement = require("../Models/Achievement");
const Activity = require("../Models/Activity");
const dotenv = require("dotenv");
const connectDB = require("../Configurations/database");

// Load environment variables
dotenv.config();

// Target User ID
const TARGET_USER_ID = "6814af5c8ae5638938d9b211";

// Sample achievements data - using the same structure as the main achievement seeder
const achievementsData = [
  // Learning Achievements
  {
    name: "First Steps",
    description: "Complete your first lesson",
    category: "learning",
    icon: "🎯",
    requirements: {
      type: "lesson_count",
      value: 1,
    },
    xpReward: 50,
    rarity: "common",
  },
  {
    name: "Quick Learner",
    description: "Complete 10 lessons",
    category: "learning",
    icon: "📚",
    requirements: {
      type: "lesson_count",
      value: 10,
    },
    xpReward: 100,
    rarity: "common",
  },
  {
    name: "Knowledge Seeker",
    description: "Reach level 5 in any language",
    category: "milestone",
    icon: "🎓",
    requirements: {
      type: "xp_total",
      value: 5000,
    },
    xpReward: 500,
    rarity: "uncommon",
  },
  // Streak Achievements
  {
    name: "Streak Starter",
    description: "Maintain a 3-day streak",
    category: "streak",
    icon: "🔥",
    requirements: {
      type: "streak_days",
      value: 3,
    },
    xpReward: 75,
    rarity: "common",
  },
  {
    name: "Streak Master",
    description: "Maintain a 7-day streak",
    category: "streak",
    icon: "🏆",
    requirements: {
      type: "streak_days",
      value: 7,
    },
    xpReward: 150,
    rarity: "uncommon",
  },
  {
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    category: "streak",
    icon: "⚡",
    requirements: {
      type: "streak_days",
      value: 30,
    },
    xpReward: 1000,
    rarity: "epic",
  },
  // Social Achievements
  {
    name: "Social Butterfly",
    description: "Add 5 friends",
    category: "social",
    icon: "🦋",
    requirements: {
      type: "friend_count",
      value: 5,
    },
    xpReward: 200,
    rarity: "uncommon",
  },
  {
    name: "Polyglot",
    description: "Start learning 3 different languages",
    category: "milestone",
    icon: "🌍",
    requirements: {
      type: "languages_count",
      value: 3,
    },
    xpReward: 300,
    rarity: "rare",
  },
  // Secret Achievement
  {
    name: "Night Owl",
    description: "Complete 10 lessons between midnight and 5 AM",
    category: "learning",
    icon: "🦉",
    requirements: {
      type: "lesson_count",
      value: 10,
    },
    xpReward: 500,
    rarity: "epic",
    isSecret: true,
  },
];

/**
 * Seed the database with achievement data and create achievement_earned activities for the target user
 */
const seedCustomAchievements = async () => {
  try {
    // Connect to the database
    await connectDB();

    console.log(
      `Creating achievement data and activities for user: ${TARGET_USER_ID}`
    );

    // Check if user's ObjectId is valid
    if (!mongoose.Types.ObjectId.isValid(TARGET_USER_ID)) {
      throw new Error("Invalid user ID format");
    }

    // First, make sure all achievements exist in database
    for (const achievementData of achievementsData) {
      await Achievement.findOneAndUpdate(
        { name: achievementData.name },
        achievementData,
        { upsert: true, new: true }
      );
    }

    // Get all achievements from database with their real _ids
    const achievements = await Achievement.find({});

    console.log(`Found ${achievements.length} achievements in database`);

    // Select some achievements as "earned" by the user
    // We'll mark Streak Starter, First Steps, and Social Butterfly as earned
    const earnedAchievementNames = [
      "First Steps",
      "Streak Starter",
      "Social Butterfly",
    ];

    // Create achievement_earned activities for the earned achievements
    const activities = [];
    const now = new Date();

    // Start from 7 days ago
    let activityDate = new Date(now);
    activityDate.setDate(activityDate.getDate() - 7);

    for (const name of earnedAchievementNames) {
      const achievement = achievements.find((a) => a.name === name);

      if (achievement) {
        console.log(`Creating activity for earned achievement: ${name}`);

        // Create activity with timestamp in the past week
        activities.push({
          userId: TARGET_USER_ID,
          type: "achievement_earned",
          details: {
            achievementId: achievement._id,
            xpEarned: achievement.xpReward,
          },
          timestamp: new Date(activityDate),
          visibility: "public",
        });

        // Add a day for the next activity
        activityDate.setDate(activityDate.getDate() + 2);
      }
    }

    // Save the activities to database
    if (activities.length > 0) {
      console.log(`Creating ${activities.length} achievement activities...`);
      await Activity.insertMany(activities);
      console.log("Achievement activities created successfully!");
    }

    console.log("Custom achievement seeding completed!");
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error seeding achievements: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder function
seedCustomAchievements();
