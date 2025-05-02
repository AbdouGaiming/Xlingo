const mongoose = require('mongoose');
const FriendInteraction = require('../Models/FriendInteraction');
const User = require('../Models/User');
const dotenv = require('dotenv');
const connectDB = require('../Configurations/database');

// Load environment variables
dotenv.config();

const generateInteractions = async (users) => {
  const interactions = [];
  const timeWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  // Generate friend requests and interactions between users
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const sender = users[i];
      const recipient = users[j];

      // Skip admin user for interactions
      if (sender.role === 'admin' || recipient.role === 'admin') continue;

      // Check if they're already friends
      const areFriends = sender.friends.some(friend => 
        friend.userId.equals(recipient._id) && friend.status === 'accepted'
      );

      if (areFriends) {
        // Generate congratulation messages for achievements
        if (recipient.achievements?.length > 0) {
          interactions.push({
            sender: sender._id,
            recipient: recipient._id,
            type: 'congratulation',
            status: 'read',
            message: 'Congratulations on your achievement! 🎉',
            metadata: {
              achievementId: recipient.achievements[0]._id
            },
            createdAt: new Date(Date.now() - Math.random() * timeWindow)
          });
        }

        // Generate challenge invites
        if (Math.random() > 0.5) {
          interactions.push({
            sender: sender._id,
            recipient: recipient._id,
            type: 'challenge',
            status: Math.random() > 0.5 ? 'accepted' : 'pending',
            message: 'Let\'s see who can earn more XP this week! 💪',
            metadata: {
              language: sender.learningProgress[0]?.language || 'spanish'
            },
            createdAt: new Date(Date.now() - Math.random() * (timeWindow / 2))
          });
        }
      } else {
        // Generate friend request if they're not friends
        const hasPendingRequest = sender.friends.some(friend => 
          friend.userId.equals(recipient._id) && friend.status === 'pending'
        );

        if (!hasPendingRequest && Math.random() > 0.7) {
          interactions.push({
            sender: sender._id,
            recipient: recipient._id,
            type: 'friend_request',
            status: 'pending',
            message: 'Would you like to be language learning buddies?',
            createdAt: new Date(Date.now() - Math.random() * timeWindow)
          });
        }
      }
    }
  }

  return interactions;
};

/**
 * Seed the database with friend interaction data
 */
const seedFriendInteractions = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      throw new Error('No users found. Please run userSeeder first.');
    }

    // Delete all existing interactions
    console.log('Deleting existing friend interactions...');
    await FriendInteraction.deleteMany({});
    
    // Generate and insert interactions
    console.log('Generating friend interactions...');
    const interactions = await generateInteractions(users);
    
    console.log('Adding new friend interactions...');
    await FriendInteraction.create(interactions);
    
    console.log('Friend interactions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding friend interactions: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedFriendInteractions();