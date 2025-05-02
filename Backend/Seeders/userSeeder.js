const mongoose = require('mongoose');
const User = require('../Models/User');
const dotenv = require('dotenv');
const connectDB = require('../Configurations/database');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

// Sample user data with more realistic learning progress and achievements
const userData = [
  {
    username: 'admin',
    email: 'admin@xlingo.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    accountStatus: 'active',
    profileImage: 'admin-avatar.png'
  },
  {
    username: 'LanguageLover',
    email: 'emma.smith@xlingo.com',
    password: 'emma123',
    firstName: 'Emma',
    lastName: 'Smith',
    role: 'user',
    isVerified: true,
    accountStatus: 'active',
    streak: {
      count: 15,
      lastActivity: new Date()
    },
    learningProgress: [
      {
        language: 'spanish',
        level: 6,
        xp: 2500,
        completedLessons: Array.from({ length: 20 }, (_, i) => ({
          lessonId: new mongoose.Types.ObjectId(),
          completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          score: Math.floor(Math.random() * 30) + 70
        }))
      },
      {
        language: 'french',
        level: 4,
        xp: 1200,
        completedLessons: Array.from({ length: 12 }, (_, i) => ({
          lessonId: new mongoose.Types.ObjectId(),
          completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          score: Math.floor(Math.random() * 30) + 70
        }))
      }
    ],
    achievements: [
      {
        name: "First Steps",
        description: "Complete your first lesson",
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: "Streak Master",
        description: "Maintain a 7-day streak",
        earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    username: 'TravelTalker',
    email: 'james.williams@xlingo.com',
    password: 'james123',
    firstName: 'James',
    lastName: 'Williams',
    role: 'user',
    isVerified: true,
    accountStatus: 'active',
    streak: {
      count: 45,
      lastActivity: new Date()
    },
    learningProgress: [
      {
        language: 'german',
        level: 8,
        xp: 4200,
        completedLessons: Array.from({ length: 35 }, (_, i) => ({
          lessonId: new mongoose.Types.ObjectId(),
          completedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          score: Math.floor(Math.random() * 20) + 80
        }))
      }
    ]
  },
  {
    username: 'WordWizard',
    email: 'olivia.brown@xlingo.com',
    password: 'olivia123',
    firstName: 'Olivia',
    lastName: 'Brown',
    role: 'user',
    isVerified: true,
    accountStatus: 'active',
    streak: {
      count: 12,
      lastActivity: new Date()
    },
    learningProgress: [
      {
        language: 'spanish',
        level: 5,
        xp: 1870
      },
      {
        language: 'french',
        level: 2,
        xp: 550
      }
    ]
  }
];

/**
 * Seed the database with initial user data
 */
const seedUsers = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Delete all existing users
    console.log('Deleting existing users...');
    await User.deleteMany({});
    
    // Hash passwords before inserting
    const hashedUsers = await Promise.all(userData.map(async user => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      return user;
    }));

    // Insert new users
    console.log('Adding new users...');
    const createdUsers = await User.create(hashedUsers);
    
    // Add friend relationships
    console.log('Setting up friend relationships...');
    const [admin, emma, james, olivia] = createdUsers;
    
    // Emma and James are friends
    emma.friends.push({
      userId: james._id,
      status: 'accepted',
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });
    james.friends.push({
      userId: emma._id,
      status: 'accepted',
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });

    // Olivia has pending request to Emma
    olivia.friends.push({
      userId: emma._id,
      status: 'pending',
      since: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Promise.all([emma.save(), james.save(), olivia.save()]);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();