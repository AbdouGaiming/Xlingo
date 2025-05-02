const mongoose = require("mongoose");

const friendInteractionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["friend_request", "message", "challenge", "congratulation"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "read", "unread"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
    },
    metadata: {
      challengeId: { type: mongoose.Schema.Types.ObjectId },
      achievementId: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
      language: String,
      score: Number
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from creation
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
friendInteractionSchema.index({ sender: 1, recipient: 1, type: 1 });
friendInteractionSchema.index({ recipient: 1, status: 1 });
friendInteractionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Add validation to prevent self-interaction
friendInteractionSchema.pre('save', function(next) {
  if (this.sender.equals(this.recipient)) {
    next(new Error('Cannot create interaction with self'));
  }
  next();
});

const FriendInteraction = mongoose.model("FriendInteraction", friendInteractionSchema);

module.exports = FriendInteraction;