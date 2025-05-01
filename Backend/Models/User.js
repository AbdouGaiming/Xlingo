const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define a schema for the User model
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "default-profile.png",
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "deleted"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: ["user", "admin", "teacher"],
      default: "user",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    accountLockedUntil: Date,
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      theme: {
        type: String,
        default: "light",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        pushNotifications: {
          type: Boolean,
          default: true,
        },
      },
    },
    learningProgress: [
      {
        language: {
          type: String,
          required: true,
        },
        level: {
          type: Number,
          default: 1,
        },
        xp: {
          type: Number,
          default: 0,
        },
        completedLessons: [
          {
            lessonId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Lesson",
            },
            completedAt: {
              type: Date,
              default: Date.now,
            },
            score: Number,
          },
        ],
      },
    ],
    streak: {
      count: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },
    friends: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "blocked"],
          default: "pending",
        },
        since: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    achievements: [
      {
        name: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    socialProfiles: {
      google: String,
      facebook: String,
      twitter: String,
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active timestamp
userSchema.methods.updateActivity = function () {
  this.lastActive = Date.now();
  return this.save();
};

// Method to check and update user's streak
userSchema.methods.updateStreak = function () {
  const now = new Date();
  const lastActivity = this.streak.lastActivity;
  const timeDiff = Math.abs(now - lastActivity);
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // User was active yesterday, increment streak
    this.streak.count += 1;
  } else if (daysDiff > 1) {
    // User missed a day, reset streak
    this.streak.count = 1;
  }

  this.streak.lastActivity = now;
  return this.save();
};

// Create a virtual property for full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
