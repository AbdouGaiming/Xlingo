const mongoose = require('mongoose');
const Activity = require('../Models/Activity');
const User = require('../Models/User');
const dotenv = require('dotenv');
const connectDB = require('../Configurations/database');

// Load environment variables
dotenv.config();

const generateActivities = async (users) => {
  const activities = [];
  const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  for (const user of users) {
    // Lesson completion activities
    const lessonCount = Math.floor(Math.random() * 5) + 3; // 3-7 lessons per user
    for (let i = 0; i < lessonCount; i++) {
      activities.push({
        userId: user._id,
        type: 'lesson_complete',
        details: {
          lessonId: new mongoose.Types.ObjectId(),
          language: user.learningProgress[0]?.language || 'spanish',
          xpEarned: Math.floor(Math.random() * 20) + 10
        },
        timestamp: new Date(Date.now() - Math.random() * timeWindow),
        visibility: 'friends'
      });
    }

    // Achievement activities
    if (user.achievements?.length > 0) {
      user.achievements.forEach(achievement => {
        activities.push({
          userId: user._id,
          type: 'achievement_earned',
          details: {
            achievementId: new mongoose.Types.ObjectId(),
            xpEarned: Math.floor(Math.random() * 100) + 50
          },
          timestamp: achievement.earnedAt,
          visibility: 'friends'
        });
      });
    }

    // Streak milestones
    if (user.streak?.count >= 7) {
      activities.push({
        userId: user._id,
        type: 'streak_milestone',
        details: {
          streakCount: 7,
          xpEarned: 150
        },
        timestamp: new Date(Date.now() - Math.random() * timeWindow),
        visibility: 'friends'
      });
    }

    // Level up activities
    if (user.learningProgress?.length > 0) {
      const levelUpCount = Math.min(user.learningProgress[0].level - 1, 2);
      for (let i = 0; i < levelUpCount; i++) {
        activities.push({
          userId: user._id,
          type: 'level_up',
          details: {
            language: user.learningProgress[0].language,
            level: user.learningProgress[0].level - i,
            xpEarned: 200
          },
          timestamp: new Date(Date.now() - (i + 1) * (24 * 60 * 60 * 1000)),
          visibility: 'friends'
        });
      }
    }

    // Friend added activities
    user.friends?.forEach(friend => {
      if (friend.status === 'accepted') {
        activities.push({
          userId: user._id,
          type: 'friend_added',
          details: {
            friendId: friend.userId
          },
          timestamp: friend.since,
          visibility: 'friends'
        });
      }
    });
  }

  return activities;
};

/**
 * Seed the database with activity data
 */
const seedActivities = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      throw new Error('No users found. Please run userSeeder first.');
    }

    // Delete all existing activities
    console.log('Deleting existing activities...');
    await Activity.deleteMany({});
    
    // Generate and insert activities
    console.log('Generating activities...');
    const activities = await generateActivities(users);
    
    console.log('Adding new activities...');
    await Activity.create(activities);
    
    console.log('Activities seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding activities: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedActivities();