const mongoose = require('mongoose');
const User = require('../Models/User');
const dotenv = require('dotenv');
const connectDB = require('../Configurations/database');

// Load environment variables
dotenv.config();

// Sample user data for seeding
const userData = [
  {
    username: 'admin',
    email: 'admin@xlingo.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    accountStatus: 'active'
  },
  {
    username: 'teacher1',
    email: 'teacher@xlingo.com',
    password: 'teacher123',
    firstName: 'Teacher',
    lastName: 'One',
    role: 'teacher',
    isVerified: true,
    accountStatus: 'active'
  },
  {
    username: 'student1',
    email: 'student@xlingo.com',
    password: 'student123',
    firstName: 'Student',
    lastName: 'One',
    role: 'user',
    isVerified: true,
    accountStatus: 'active',
    learningProgress: [
      {
        language: 'spanish',
        level: 2,
        xp: 150
      }
    ]
  },
  {
    username: 'testuser',
    email: 'test@xlingo.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: false,
    accountStatus: 'active'
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
    
    // Insert new users
    console.log('Adding new users...');
    await User.create(userData);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();