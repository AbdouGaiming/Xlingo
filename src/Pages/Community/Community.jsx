import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Community.scss';
import { API_URL } from '../../config';

// Import components
import FriendList from './components/FriendList';
import FriendRequests from './components/FriendRequests';
import FindFriends from './components/FindFriends';
import FriendLeaderboard from './components/FriendLeaderboard';
import FriendActivity from './components/FriendActivity';
import FriendProfile from './components/profile/FriendProfile';

const Community = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({
    incoming: [],
    outgoing: []
  });

  // If we have a userId in the params, we should be showing the friend profile
  const showingProfile = !!userId;

  // Fetch friends and friend requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('xlingoToken');
        
        // Fetch friend requests
        const requestsResponse = await fetch(`${API_URL}/community/friends/requests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const requestsData = await requestsResponse.json();
        
        if (requestsData.success) {
          setFriendRequests(requestsData.requests);
        }

        // Fetch friends list
        const friendsResponse = await fetch(`${API_URL}/community/friends`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const friendsData = await friendsResponse.json();
        
        if (friendsData.success) {
          setFriends(friendsData.friends);
        }

        setLoading(false);
      } catch (error) {
        setError("Failed to load community data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle friend actions
  const handleRemoveFriend = async (friendId) => {
    try {
      const token = localStorage.getItem('xlingoToken');
      const response = await fetch(`${API_URL}/community/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFriends(friends.filter(friend => friend.id !== friendId));
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    const request = friendRequests.incoming.find(req => req.id === userId);
    if (request) {
      setFriends([...friends, {
        id: request.id,
        username: request.username,
        firstName: request.firstName,
        lastName: request.lastName,
        profileImage: request.profileImage,
        friendSince: new Date().toISOString()
      }]);
      setFriendRequests({
        ...friendRequests,
        incoming: friendRequests.incoming.filter(req => req.id !== userId)
      });
    }
  };

  const handleRejectRequest = (userId) => {
    setFriendRequests({
      ...friendRequests,
      incoming: friendRequests.incoming.filter(req => req.id !== userId)
    });
  };

  const handleCancelRequest = (userId) => {
    setFriendRequests({
      ...friendRequests,
      outgoing: friendRequests.outgoing.filter(req => req.id !== userId)
    });
  };

  const handleSendFriendRequest = (user) => {
    setFriendRequests({
      ...friendRequests,
      outgoing: [...friendRequests.outgoing, {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        requestDate: new Date().toISOString()
      }]
    });
  };

  const handleViewProfile = (friendId) => {
    navigate(`/community/profile/${friendId}`);
  };

  // Notification count for friend requests tab
  const requestCount = friendRequests.incoming.length;

  if (showingProfile) {
    return <FriendProfile />;
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community</h1>
        <p>Connect with other language learners and track your progress together</p>
      </div>

      <div className="community-content">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="community-tabs">
              <button 
                className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                <span className="tab-icon">👥</span>
                Friends
              </button>
              <button 
                className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <span className="tab-icon">📨</span>
                Friend Requests
                {requestCount > 0 && (
                  <span className="request-count">{requestCount}</span>
                )}
              </button>
              <button 
                className={`tab-button ${activeTab === 'find' ? 'active' : ''}`}
                onClick={() => setActiveTab('find')}
              >
                <span className="tab-icon">🔍</span>
                Find Friends
              </button>
              <button 
                className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <span className="tab-icon">🏆</span>
                Leaderboard
              </button>
              <button 
                className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <span className="tab-icon">📊</span>
                Activity
              </button>
            </div>

            {activeTab === 'friends' && (
              <FriendList 
                friends={friends} 
                onRemoveFriend={handleRemoveFriend}
                onViewProfile={handleViewProfile}
              />
            )}

            {activeTab === 'requests' && (
              <FriendRequests 
                requests={friendRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onCancel={handleCancelRequest}
              />
            )}

            {activeTab === 'find' && (
              <FindFriends 
                currentFriends={friends}
                pendingRequests={[...friendRequests.incoming, ...friendRequests.outgoing]}
                onSendRequest={handleSendFriendRequest}
              />
            )}

            {activeTab === 'leaderboard' && (
              <FriendLeaderboard friends={friends} />
            )}

            {activeTab === 'activity' && (
              <FriendActivity friends={friends} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Community;