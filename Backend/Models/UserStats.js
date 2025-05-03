const mongoose = require("mongoose");

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dailyGoals: {
      xpTarget: {
        type: Number,
        default: 30,
      },
      lessonsTarget: {
        type: Number,
        default: 2,
      },
      vocabularyTarget: {
        type: Number,
        default: 10,
      },
    },
    dailyProgress: {
      date: {
        type: Date,
        default: Date.now,
      },
      xpEarned: {
        type: Number,
        default: 0,
      },
      lessonsCompleted: {
        type: Number,
        default: 0,
      },
      vocabularyLearned: {
        type: Number,
        default: 0,
      },
    },
    streakHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        xpEarned: {
          type: Number,
          default: 0,
        },
        goalsCompleted: {
          type: Number,
          default: 0,
        },
      },
    ],
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalXpEarned: {
      type: Number,
      default: 0,
    },
    weeklyXP: [
      {
        day: {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        xp: {
          type: Number,
          default: 0,
        },
        date: Date,
      },
    ],
    achievements: [
      {
        achievementId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Achievement",
        },
        dateEarned: {
          type: Date,
          default: Date.now,
        },
        xpAwarded: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
userStatsSchema.index({ userId: 1 });

// Create a daily stats entry
userStatsSchema.statics.createDailyEntry = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Reset daily progress if it's a new day
  const userStats = await this.findOne({ userId });
  if (userStats) {
    const lastProgressDate = new Date(userStats.dailyProgress.date);
    lastProgressDate.setHours(0, 0, 0, 0);

    if (lastProgressDate.getTime() !== today.getTime()) {
      // It's a new day, save yesterday's progress to streak history
      userStats.streakHistory.push({
        date: lastProgressDate,
        xpEarned: userStats.dailyProgress.xpEarned,
        goalsCompleted: calculateGoalsCompleted(userStats),
      });

      // Reset daily progress
      userStats.dailyProgress = {
        date: today,
        xpEarned: 0,
        lessonsCompleted: 0,
        vocabularyLearned: 0,
      };

      await userStats.save();
    }
    return userStats;
  }

  // Create new user stats if not exists
  return this.create({
    userId,
    dailyProgress: {
      date: today,
      xpEarned: 0,
      lessonsCompleted: 0,
      vocabularyLearned: 0,
    },
    weeklyXP: initializeWeeklyXP(),
  });
};

// Helper function to calculate goals completed
function calculateGoalsCompleted(userStats) {
  let completed = 0;
  
  if (userStats.dailyProgress.xpEarned >= userStats.dailyGoals.xpTarget) {
    completed++;
  }
  
  if (userStats.dailyProgress.lessonsCompleted >= userStats.dailyGoals.lessonsTarget) {
    completed++;
  }
  
  if (userStats.dailyProgress.vocabularyLearned >= userStats.dailyGoals.vocabularyTarget) {
    completed++;
  }
  
  return completed;
}

// Helper function to initialize weekly XP tracking
function initializeWeeklyXP() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Convert to our days array index (where Monday is 0)
  const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weeklyXP = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDayIndex + i);
    date.setHours(0, 0, 0, 0);
    
    weeklyXP.push({
      day: days[i],
      xp: 0,
      date: date,
    });
  }
  
  return weeklyXP;
}

const UserStats = mongoose.model("UserStats", userStatsSchema);

module.exports = UserStats;