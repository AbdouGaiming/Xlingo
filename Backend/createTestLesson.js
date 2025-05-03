/**
 * Utility to manually create a test lesson
 * Run this script directly with: node createTestLesson.js
 */

const mongoose = require("mongoose");
const Lesson = require("./Models/Lesson");
const connectDB = require("./Configurations/database");

// Sample lesson data for testing
const testLesson = {
  title: "Spanish Basics: Greetings",
  description: "Learn common Spanish greetings and introductions",
  language: "spanish",
  type: "vocabulary",
  difficulty: 1,
  xpReward: 20,
  content: {
    vocabulary: [
      { word: "Hola", translation: "Hello" },
      { word: "Buenos días", translation: "Good morning" },
      { word: "Buenas tardes", translation: "Good afternoon" },
      { word: "Buenas noches", translation: "Good evening/night" },
      { word: "¿Cómo estás?", translation: "How are you?" }
    ],
    exercises: [
      {
        type: "match",
        prompt: "Match the Spanish greeting with its English translation",
        pairs: [
          { left: "Hola", right: "Hello" },
          { left: "Buenas tardes", right: "Good afternoon" },
          { left: "¿Cómo estás?", right: "How are you?" }
        ]
      }
    ]
  },
  order: 1,
  estimatedTime: 15,
  isActive: true
};

// Function to create a test lesson
const createTestLesson = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log("Connected to MongoDB");
    
    // Create the lesson
    const newLesson = new Lesson(testLesson);
    const savedLesson = await newLesson.save();
    
    console.log("Test lesson created successfully!");
    console.log("Lesson ID:", savedLesson._id);
    console.log("Lesson Title:", savedLesson.title);
    
    // Disconnect from database
    await mongoose.connection.close();
    console.log("Database connection closed");
    
    return savedLesson;
  } catch (error) {
    console.error("Error creating test lesson:", error);
    
    // Ensure database connection is closed even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
    
    process.exit(1);
  }
};

// Run the function
createTestLesson();