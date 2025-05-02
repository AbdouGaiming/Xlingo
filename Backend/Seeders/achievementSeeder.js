const mongoose = require('mongoose');
const Achievement = require('../Models/Achievement');
const dotenv = require('dotenv');
const connectDB = require('../Configurations/database');

// Load environment variables
dotenv.config();

// Sample achievements data
const achievementsData = [
  // Learning Achievements
  {
    name: "First Steps",
    description: "Complete your first lesson",
    category: "learning",
    icon: "🎯",
    requirements: {
      type: "lesson_count",
      value: 1
    },
    xpReward: 50,
    rarity: "common"
  },
  {
    name: "Quick Learner",
    description: "Complete 10 lessons",
    category: "learning",
    icon: "📚",
    requirements: {
      type: "lesson_count",
      value: 10
    },
    xpReward: 100,
    rarity: "common"
  },
  {
    name: "Knowledge Seeker",
    description: "Reach level 5 in any language",
    category: "milestone",
    icon: "🎓",
    requirements: {
      type: "xp_total",
      value: 5000
    },
    xpReward: 500,
    rarity: "uncommon"
  },
  // Streak Achievements
  {
    name: "Streak Starter",
    description: "Maintain a 3-day streak",
    category: "streak",
    icon: "🔥",
    requirements: {
      type: "streak_days",
      value: 3
    },
    xpReward: 75,
    rarity: "common"
  },
  {
    name: "Streak Master",
    description: "Maintain a 7-day streak",
    category: "streak",
    icon: "🏆",
    requirements: {
      type: "streak_days",
      value: 7
    },
    xpReward: 150,
    rarity: "uncommon"
  },
  {
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    category: "streak",
    icon: "⚡",
    requirements: {
      type: "streak_days",
      value: 30
    },
    xpReward: 1000,
    rarity: "epic"
  },
  // Social Achievements
  {
    name: "Social Butterfly",
    description: "Add 5 friends",
    category: "social",
    icon: "🦋",
    requirements: {
      type: "friend_count",
      value: 5
    },
    xpReward: 200,
    rarity: "uncommon"
  },
  {
    name: "Polyglot",
    description: "Start learning 3 different languages",
    category: "milestone",
    icon: "🌍",
    requirements: {
      type: "languages_count",
      value: 3
    },
    xpReward: 300,
    rarity: "rare"
  },
  // Secret Achievement
  {
    name: "Night Owl",
    description: "Complete 10 lessons between midnight and 5 AM",
    category: "learning",
    icon: "🦉",
    requirements: {
      type: "lesson_count",
      value: 10
    },
    xpReward: 500,
    rarity: "epic",
    isSecret: true
  }
];

/**
 * Seed the database with achievement data
 */
const seedAchievements = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Delete all existing achievements
    console.log('Deleting existing achievements...');
    await Achievement.deleteMany({});
    
    // Insert new achievements
    console.log('Adding new achievements...');
    await Achievement.create(achievementsData);
    
    console.log('Achievements seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding achievements: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedAchievements();