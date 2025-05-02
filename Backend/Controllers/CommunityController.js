const User = require('../Models/User');
const FriendInteraction = require('../Models/FriendInteraction');
const Activity = require('../Models/Activity');

class CommunityController {
  // Get user's friends list
  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      
      // Find all friend interactions where the user is involved
      const friendInteractions = await FriendInteraction.find({
        $or: [
          { user1: userId, status: 'accepted' },
          { user2: userId, status: 'accepted' }
        ]
      }).populate('user1 user2', 'username firstName lastName profileImage streak languages learningProgress');

      // Transform the data to get friend details
      const friends = friendInteractions.map(interaction => {
        const friend = interaction.user1.id === userId ? interaction.user2 : interaction.user1;
        return {
          id: friend._id,
          username: friend.username,
          firstName: friend.firstName,
          lastName: friend.lastName,
          profileImage: friend.profileImage,
          friendSince: interaction.acceptedAt,
          streak: friend.streak,
          languages: friend.languages,
          learningProgress: friend.learningProgress
        };
      });

      res.json({ success: true, friends });
    } catch (error) {
      console.error('Error getting friends:', error);
      res.status(500).json({ success: false, message: 'Failed to get friends list' });
    }
  }

  // Get friend requests (both incoming and outgoing)
  async getFriendRequests(req, res) {
    try {
      const userId = req.user.id;

      // Find incoming requests
      const incomingRequests = await FriendInteraction.find({
        user2: userId,
        status: 'pending'
      }).populate('user1', 'username firstName lastName profileImage');

      // Find outgoing requests
      const outgoingRequests = await FriendInteraction.find({
        user1: userId,
        status: 'pending'
      }).populate('user2', 'username firstName lastName profileImage');

      // Transform the data
      const requests = {
        incoming: incomingRequests.map(req => ({
          id: req.user1._id,
          username: req.user1.username,
          firstName: req.user1.firstName,
          lastName: req.user1.lastName,
          profileImage: req.user1.profileImage,
          requestDate: req.createdAt
        })),
        outgoing: outgoingRequests.map(req => ({
          id: req.user2._id,
          username: req.user2.username,
          firstName: req.user2.firstName,
          lastName: req.user2.lastName,
          profileImage: req.user2.profileImage,
          requestDate: req.createdAt
        }))
      };

      res.json({ success: true, requests });
    } catch (error) {
      console.error('Error getting friend requests:', error);
      res.status(500).json({ success: false, message: 'Failed to get friend requests' });
    }
  }

  // Send friend request
  async sendFriendRequest(req, res) {
    try {
      const { targetUserId } = req.body;
      const userId = req.user.id;

      // Check if users exist
      const [sender, receiver] = await Promise.all([
        User.findById(userId),
        User.findById(targetUserId)
      ]);

      if (!receiver) {
        return res.status(404).json({ success: false, message: 'Target user not found' });
      }

      // Check if request already exists
      const existingRequest = await FriendInteraction.findOne({
        $or: [
          { user1: userId, user2: targetUserId },
          { user1: targetUserId, user2: userId }
        ]
      });

      if (existingRequest) {
        return res.status(400).json({ 
          success: false, 
          message: 'Friend request already exists or users are already friends' 
        });
      }

      // Create new friend request
      const friendRequest = new FriendInteraction({
        user1: userId,
        user2: targetUserId,
        status: 'pending'
      });

      await friendRequest.save();

      res.json({ 
        success: true, 
        message: 'Friend request sent successfully',
        request: {
          id: receiver._id,
          username: receiver.username,
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          profileImage: receiver.profileImage,
          requestDate: friendRequest.createdAt
        }
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ success: false, message: 'Failed to send friend request' });
    }
  }

  // Accept friend request
  async acceptFriendRequest(req, res) {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;

      const friendRequest = await FriendInteraction.findOne({
        user1: requestId,
        user2: userId,
        status: 'pending'
      });

      if (!friendRequest) {
        return res.status(404).json({ success: false, message: 'Friend request not found' });
      }

      friendRequest.status = 'accepted';
      friendRequest.acceptedAt = new Date();
      await friendRequest.save();

      // Get friend details
      const friend = await User.findById(requestId);

      res.json({ 
        success: true, 
        message: 'Friend request accepted',
        friend: {
          id: friend._id,
          username: friend.username,
          firstName: friend.firstName,
          lastName: friend.lastName,
          profileImage: friend.profileImage,
          friendSince: friendRequest.acceptedAt,
          streak: friend.streak,
          languages: friend.languages,
          learningProgress: friend.learningProgress
        }
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      res.status(500).json({ success: false, message: 'Failed to accept friend request' });
    }
  }

  // Reject friend request
  async rejectFriendRequest(req, res) {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;

      const result = await FriendInteraction.findOneAndDelete({
        user1: requestId,
        user2: userId,
        status: 'pending'
      });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Friend request not found' });
      }

      res.json({ success: true, message: 'Friend request rejected' });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      res.status(500).json({ success: false, message: 'Failed to reject friend request' });
    }
  }

  // Cancel outgoing friend request
  async cancelFriendRequest(req, res) {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;

      const result = await FriendInteraction.findOneAndDelete({
        user1: userId,
        user2: requestId,
        status: 'pending'
      });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Friend request not found' });
      }

      res.json({ success: true, message: 'Friend request cancelled' });
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      res.status(500).json({ success: false, message: 'Failed to cancel friend request' });
    }
  }

  // Remove friend
  async removeFriend(req, res) {
    try {
      const { friendId } = req.params;
      const userId = req.user.id;

      const result = await FriendInteraction.findOneAndDelete({
        $or: [
          { user1: userId, user2: friendId },
          { user1: friendId, user2: userId }
        ],
        status: 'accepted'
      });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Friend relationship not found' });
      }

      res.json({ success: true, message: 'Friend removed successfully' });
    } catch (error) {
      console.error('Error removing friend:', error);
      res.status(500).json({ success: false, message: 'Failed to remove friend' });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      const userId = req.user.id;

      if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      // Find users matching the search query
      const users = await User.find({
        $and: [
          { _id: { $ne: userId } }, // Exclude current user
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      }).select('username firstName lastName profileImage languages');

      res.json({ success: true, users });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ success: false, message: 'Failed to search users' });
    }
  }

  // Get friend's profile
  async getFriendProfile(req, res) {
    try {
      const { friendId } = req.params;
      const userId = req.user.id;

      // Check if they are friends
      const areFriends = await FriendInteraction.exists({
        $or: [
          { user1: userId, user2: friendId },
          { user1: friendId, user2: userId }
        ],
        status: 'accepted'
      });

      if (!areFriends) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
      }

      const friend = await User.findById(friendId)
        .select('username firstName lastName profileImage streak languages learningProgress');

      if (!friend) {
        return res.status(404).json({ success: false, message: 'Friend not found' });
      }

      res.json({ success: true, profile: friend });
    } catch (error) {
      console.error('Error getting friend profile:', error);
      res.status(500).json({ success: false, message: 'Failed to get friend profile' });
    }
  }

  // Get friend leaderboard
  async getFriendLeaderboard(req, res) {
    try {
      const userId = req.user.id;

      // Get all friends
      const friendInteractions = await FriendInteraction.find({
        $or: [
          { user1: userId, status: 'accepted' },
          { user2: userId, status: 'accepted' }
        ]
      });

      const friendIds = friendInteractions.map(interaction => 
        interaction.user1.toString() === userId ? interaction.user2 : interaction.user1
      );

      // Include current user in leaderboard
      friendIds.push(userId);

      // Get user data for leaderboard
      const users = await User.find({
        _id: { $in: friendIds }
      }).select('username firstName lastName profileImage streak languages learningProgress');

      // Sort users by XP (sum of all language XP)
      const leaderboard = users.map(user => ({
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        totalXp: user.learningProgress.reduce((sum, prog) => sum + prog.xp, 0),
        streak: user.streak,
        languages: user.languages
      })).sort((a, b) => b.totalXp - a.totalXp);

      res.json({ success: true, leaderboard });
    } catch (error) {
      console.error('Error getting friend leaderboard:', error);
      res.status(500).json({ success: false, message: 'Failed to get friend leaderboard' });
    }
  }

  // Get friend activity feed
  async getFriendActivity(req, res) {
    try {
      const userId = req.user.id;

      // Get all friends
      const friendInteractions = await FriendInteraction.find({
        $or: [
          { user1: userId, status: 'accepted' },
          { user2: userId, status: 'accepted' }
        ]
      });

      const friendIds = friendInteractions.map(interaction => 
        interaction.user1.toString() === userId ? interaction.user2 : interaction.user1
      );

      // Get recent activities
      const activities = await Activity.find({
        userId: { $in: friendIds }
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'username firstName lastName profileImage');

      const formattedActivities = activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        details: activity.details,
        createdAt: activity.createdAt,
        user: {
          id: activity.userId._id,
          username: activity.userId.username,
          firstName: activity.userId.firstName,
          lastName: activity.userId.lastName,
          profileImage: activity.userId.profileImage
        }
      }));

      res.json({ success: true, activities: formattedActivities });
    } catch (error) {
      console.error('Error getting friend activity:', error);
      res.status(500).json({ success: false, message: 'Failed to get friend activity' });
    }
  }
}

module.exports = new CommunityController();