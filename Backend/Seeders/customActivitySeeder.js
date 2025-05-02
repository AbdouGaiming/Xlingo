const mongoose = require("mongoose");
const Activity = require("../Models/Activity");
const dotenv = require("dotenv");
const connectDB = require("../Configurations/database");

// Load environment variables
dotenv.config();

// Target User ID
const TARGET_USER_ID = "6814af5c8ae5638938d9b211";

/**
 * Seed the database with activity data for a specific user
 */
const seedCustomActivities = async () => {
  try {
    // Connect to the database
    await connectDB();

    console.log(`Creating activity data for user: ${TARGET_USER_ID}`);

    // Check if user's ObjectId is valid
    if (!mongoose.Types.ObjectId.isValid(TARGET_USER_ID)) {
      throw new Error("Invalid user ID format");
    }

    const now = new Date();
    const activities = [];

    // Create streak milestone activities (to show streak progress)
    // We'll create a simulated streak of 21 days

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

    // Create lesson completion activities - one for each of the last 21 days
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

    // Language started activity
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

    // Level up activities
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

    // Add friend activities
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

    // Delete any existing activities for this user
    console.log(`Deleting existing activities for user: ${TARGET_USER_ID}`);
    await Activity.deleteMany({ userId: TARGET_USER_ID });

    // Save the activities to database
    console.log(`Creating ${activities.length} activities...`);
    await Activity.insertMany(activities);
    console.log("Activities created successfully!");

    console.log("Custom activity seeding completed!");
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error seeding activities: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder function
seedCustomActivities();
