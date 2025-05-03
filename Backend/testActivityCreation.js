/**
 * Utility to test lesson completion activity and streak update
 * Run this script after creating a test lesson with: node testActivityCreation.js
 */

const mongoose = require("mongoose");
const Activity = require("./Models/Activity");
const User = require("./Models/User");
const Lesson = require("./Models/Lesson");
const connectDB = require("./Configurations/database");

// Test function to create a lesson completion activity
const testLessonCompletion = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log("Connected to MongoDB");
    
    // Step 1: Find a user (we'll use the first one we find for this test)
    const user = await User.findOne();
    if (!user) {
      console.error("No user found. Please create a user first.");
      await mongoose.connection.close();
      return;
    }
    console.log("Found user:", user.username, "with ID:", user._id);
    
    // Step 2: Find a lesson (we'll use the first one we find for this test)
    const lesson = await Lesson.findOne();
    if (!lesson) {
      console.error("No lesson found. Please create a lesson first using createTestLesson.js");
      await mongoose.connection.close();
      return;
    }
    console.log("Found lesson:", lesson.title, "with ID:", lesson._id);
    
    // Step 3: Check user's current streak
    console.log("Current user streak:", user.streak.count);
    console.log("Last activity date:", user.streak.lastActivity);
    
    // Step 4: Create a lesson completion activity
    const newActivity = new Activity({
      userId: user._id,
      type: "lesson_complete",
      details: {
        lessonId: lesson._id,
        score: 95,
        timeSpent: 840, // seconds
        xpEarned: lesson.xpReward
      },
      timestamp: new Date(),
      visibility: "public"
    });
    
    // Save the activity
    const savedActivity = await newActivity.save();
    console.log("Activity created:", savedActivity._id);
    
    // Step 5: Update user's streak by calling the method in ActivityController
    // This simulates what happens in your actual API
    const userBeforeUpdate = await User.findById(user._id);
    await userBeforeUpdate.updateStreak();
    await User.findByIdAndUpdate(user._id, {
      $inc: { xp: lesson.xpReward }
    });
    
    // Get updated user data
    const updatedUser = await User.findById(user._id);
    
    // Log the results
    console.log("=== STREAK UPDATED ===");
    console.log("Previous streak:", user.streak.count);
    console.log("Current streak:", updatedUser.streak.count);
    console.log("Last activity date:", updatedUser.streak.lastActivity);
    console.log("XP before:", user.xp || 0);
    console.log("XP after:", updatedUser.xp || 0);
    
    // Check if we hit a streak milestone (just for testing)
    const milestones = [7, 14, 21, 30, 60, 90, 180, 365];
    if (milestones.includes(updatedUser.streak.count)) {
      console.log("🎉 STREAK MILESTONE ACHIEVED:", updatedUser.streak.count, "days!");
      
      // Simulate creating a streak milestone activity
      const streakActivity = new Activity({
        userId: user._id,
        type: "streak_milestone",
        details: {
          streakCount: updatedUser.streak.count,
          xpEarned: updatedUser.streak.count * 10 // 10 XP per day in streak
        },
        timestamp: new Date(),
        visibility: "public"
      });
      
      await streakActivity.save();
      console.log("Streak milestone activity created");
      
      // Award XP for the streak milestone
      await User.findByIdAndUpdate(user._id, {
        $inc: { xp: updatedUser.streak.count * 10 }
      });
      
      const finalUser = await User.findById(user._id);
      console.log("XP after milestone bonus:", finalUser.xp);
    }
    
    // Disconnect from database
    await mongoose.connection.close();
    console.log("Database connection closed");
    
  } catch (error) {
    console.error("Error testing activity creation:", error);
    
    // Ensure database connection is closed even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
  }
};

// Run the function
testLessonCompletion();