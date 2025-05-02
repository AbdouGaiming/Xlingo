const mongoose = require("mongoose");
const Achievement = require("../Models/Achievement");
const Activity = require("../Models/Activity");
const dotenv = require("dotenv");
const connectDB = require("../Configurations/database");

// Load environment variables
dotenv.config();

// Target User ID
const TARGET_USER_ID = "6814af5c8ae5638938d9b211";

const seedAchievementsAndActivities = async () => {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    // First, ensure all achievements exist
    console.log("Setting up achievements...");

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

    // Create or update achievements in the database
    for (const achievement of achievementsData) {
      await Achievement.findOneAndUpdate(
        { name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
    }

    console.log("Achievements created or updated");

    // Get all achievements from the database (with their MongoDB _ids)
    const achievements = await Achievement.find({});
    console.log(`Found ${achievements.length} achievements in database`);

    // Clear all activities for the target user
    console.log(`Deleting existing activities for user: ${TARGET_USER_ID}`);
    await Activity.deleteMany({ userId: TARGET_USER_ID });

    // Set up activities
    console.log("Creating activities for user...");
    const now = new Date();
    const activities = [];

    // 1. Create achievement activities - Mark some achievements as earned
    const earnedAchievementNames = [
      "First Steps",
      "Streak Starter",
      "Social Butterfly",
    ];
    let activityDate = new Date(now);
    activityDate.setDate(activityDate.getDate() - 7);

    for (const name of earnedAchievementNames) {
      const achievement = achievements.find((a) => a.name === name);
      if (achievement) {
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
        activityDate.setDate(activityDate.getDate() + 2);
      }
    }

    // 2. Create streak milestone activities
    // 3-day streak milestone
    activities.push({
      userId: TARGET_USER_ID,
      type: "streak_milestone",
      details: {
        streakCount: 3,
        xpEarned: 75,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 18
      ),
      visibility: "public",
    });

    // 7-day streak milestone
    activities.push({
      userId: TARGET_USER_ID,
      type: "streak_milestone",
      details: {
        streakCount: 7,
        xpEarned: 150,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14
      ),
      visibility: "public",
    });

    // 14-day streak milestone
    activities.push({
      userId: TARGET_USER_ID,
      type: "streak_milestone",
      details: {
        streakCount: 14,
        xpEarned: 300,
      },
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      visibility: "public",
    });

    // 21-day streak milestone
    activities.push({
      userId: TARGET_USER_ID,
      type: "streak_milestone",
      details: {
        streakCount: 21,
        xpEarned: 500,
      },
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 0), // Today
      visibility: "public",
    });

    // 3. Create lesson completion activities - one for each of the last 21 days
    // to match the streak milestone
    for (let i = 0; i < 21; i++) {
      activities.push({
        userId: TARGET_USER_ID,
        type: "lesson_complete",
        details: {
          lessonId: new mongoose.Types.ObjectId(), // Dummy lesson ID
          language: "spanish", // Default language
          xpEarned: Math.floor(Math.random() * 15) + 15, // 15-30 XP per lesson
        },
        timestamp: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i
        ),
        visibility: "public",
      });
    }

    // 4. Language started activity
    activities.push({
      userId: TARGET_USER_ID,
      type: "language_started",
      details: {
        language: "spanish",
        xpEarned: 50,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 21
      ),
      visibility: "public",
    });

    // 5. Level up activities
    activities.push({
      userId: TARGET_USER_ID,
      type: "level_up",
      details: {
        language: "spanish",
        level: 2,
        xpEarned: 100,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 17
      ),
      visibility: "public",
    });

    activities.push({
      userId: TARGET_USER_ID,
      type: "level_up",
      details: {
        language: "spanish",
        level: 3,
        xpEarned: 150,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 10
      ),
      visibility: "public",
    });

    activities.push({
      userId: TARGET_USER_ID,
      type: "level_up",
      details: {
        language: "spanish",
        level: 4,
        xpEarned: 200,
      },
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      visibility: "public",
    });

    // 6. Add friend activities
    activities.push({
      userId: TARGET_USER_ID,
      type: "friend_added",
      details: {
        friendId: new mongoose.Types.ObjectId(), // Random friend ID
        xpEarned: 50,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 15
      ),
      visibility: "public",
    });

    activities.push({
      userId: TARGET_USER_ID,
      type: "friend_added",
      details: {
        friendId: new mongoose.Types.ObjectId(), // Random friend ID
        xpEarned: 50,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 12
      ),
      visibility: "public",
    });

    activities.push({
      userId: TARGET_USER_ID,
      type: "friend_added",
      details: {
        friendId: new mongoose.Types.ObjectId(), // Random friend ID
        xpEarned: 50,
      },
      timestamp: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 10
      ),
      visibility: "public",
    });

    activities.push({
      userId: TARGET_USER_ID,
      type: "friend_added",
      details: {
        friendId: new mongoose.Types.ObjectId(), // Random friend ID
        xpEarned: 50,
      },
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      visibility: "public",
    });

    activities.push({
      userId: TARGET_USER_ID,
      type: "friend_added",
      details: {
        friendId: new mongoose.Types.ObjectId(), // Random friend ID
        xpEarned: 50,
      },
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      visibility: "public",
    });

    // Save all activities to the database
    console.log(`Creating ${activities.length} activities...`);
    await Activity.insertMany(activities);
    console.log(
      `Successfully created ${activities.length} activities for user ${TARGET_USER_ID}`
    );

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    console.error(error.stack);
  } finally {
    console.log("Closing database connection...");
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seeder function
seedAchievementsAndActivities();
