import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Community.scss';

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

  // Generate mock friends data
  useEffect(() => {
    // This would be a server call in a real app
    const fetchData = () => {
      setTimeout(() => {
        try {
          // Generate mock friends data
          const mockFriends = [
            {
              id: 1,
              username: "LanguageLover",
              firstName: "Emma",
              lastName: "Smith",
              profileImage: null,
              friendSince: new Date(Date.now() - 30 * 24 * 3600000).toISOString(), // 30 days ago
              streak: { count: 15 },
              languages: [
                { language: "es", name: "Spanish", flag: "🇪🇸", level: 6 },
                { language: "fr", name: "French", flag: "🇫🇷", level: 4 }
              ],
              learningProgress: [
                { language: "es", xp: 2500, level: 6 },
                { language: "fr", xp: 1200, level: 4 }
              ]
            },
            {
              id: 2,
              username: "TravelTalker",
              firstName: "James",
              lastName: "Williams",
              profileImage: null,
              friendSince: new Date(Date.now() - 60 * 24 * 3600000).toISOString(), // 60 days ago
              streak: { count: 45 },
              languages: [
                { language: "de", name: "German", flag: "🇩🇪", level: 8 },
                { language: "it", name: "Italian", flag: "🇮🇹", level: 3 }
              ],
              learningProgress: [
                { language: "de", xp: 4200, level: 8 },
                { language: "it", xp: 950, level: 3 }
              ]
            },
            {
              id: 3,
              username: "WordWizard",
              firstName: "Olivia",
              lastName: "Brown",
              profileImage: null,
              friendSince: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), // 15 days ago
              streak: { count: 12 },
              languages: [
                { language: "es", name: "Spanish", flag: "🇪🇸", level: 5 },
                { language: "fr", name: "French", flag: "🇫🇷", level: 2 }
              ],
              learningProgress: [
                { language: "es", xp: 1870, level: 5 },
                { language: "fr", xp: 550, level: 2 }
              ]
            },
            {
              id: 4,
              username: "LingoMaster",
              firstName: "Noah",
              lastName: "Johnson",
              profileImage: null,
              friendSince: new Date(Date.now() - 45 * 24 * 3600000).toISOString(), // 45 days ago
              streak: { count: 32 },
              languages: [
                { language: "es", name: "Spanish", flag: "🇪🇸", level: 9 },
                { language: "de", name: "German", flag: "🇩🇪", level: 7 }
              ],
              learningProgress: [
                { language: "es", xp: 5400, level: 9 },
                { language: "de", xp: 3200, level: 7 }
              ]
            },
            {
              id: 5,
              username: "PolyglotPro",
              firstName: "Sofia",
              lastName: "Martinez",
              profileImage: null,
              friendSince: new Date(Date.now() - 75 * 24 * 3600000).toISOString(), // 75 days ago
              streak: { count: 65 },
              languages: [
                { language: "fr", name: "French", flag: "🇫🇷", level: 10 },
                { language: "it", name: "Italian", flag: "🇮🇹", level: 8 },
                { language: "es", name: "Spanish", flag: "🇪🇸", level: 6 }
              ],
              learningProgress: [
                { language: "fr", xp: 6800, level: 10 },
                { language: "it", xp: 4300, level: 8 },
                { language: "es", xp: 2900, level: 6 }
              ]
            }
          ];

          // Generate mock friend requests
          const mockFriendRequests = {
            incoming: [
              {
                id: 6,
                username: "VerbVoyager",
                firstName: "Lucas",
                lastName: "Anderson",
                profileImage: null,
                requestDate: new Date(Date.now() - 2 * 24 * 3600000).toISOString() // 2 days ago
              },
              {
                id: 7,
                username: "SyntaxSeeker",
                firstName: "Ava",
                lastName: "Thompson",
                profileImage: null,
                requestDate: new Date(Date.now() - 5 * 24 * 3600000).toISOString() // 5 days ago
              }
            ],
            outgoing: [
              {
                id: 8,
                username: "GrammarGuru",
                firstName: "Ethan",
                lastName: "Davis",
                profileImage: null,
                requestDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString() // 1 day ago
              }
            ]
          };

          setFriends(mockFriends);
          setFriendRequests(mockFriendRequests);
          setLoading(false);
        } catch (error) {
          setError("Failed to load community data. Please try again later.");
          setLoading(false);
        }
      }, 1000); // Simulate network delay
    };

    fetchData();
  }, []);

  // Handle friend actions
  const handleRemoveFriend = (friendId) => {
    setFriends(friends.filter(friend => friend.id !== friendId));
  };

  const handleAcceptRequest = (userId) => {
    // Move from incoming requests to friends
    const newFriend = friendRequests.incoming.find(req => req.id === userId);
    if (newFriend) {
      const updatedFriend = {
        ...newFriend,
        friendSince: new Date().toISOString(),
        streak: { count: Math.floor(Math.random() * 10) },
        languages: [
          { language: "es", name: "Spanish", flag: "🇪🇸", level: Math.floor(Math.random() * 5) + 1 }
        ],
        learningProgress: [
          { language: "es", xp: Math.floor(Math.random() * 1500) + 500, level: Math.floor(Math.random() * 5) + 1 }
        ]
      };
      
      setFriends([...friends, updatedFriend]);
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
    // Add to outgoing requests
    const newRequest = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      requestDate: new Date().toISOString()
    };
    
    setFriendRequests({
      ...friendRequests,
      outgoing: [...friendRequests.outgoing, newRequest]
    });
  };

  const handleViewProfile = (friendId) => {
    navigate(`/community/profile/${friendId}`);
  };

  // Notification count for friend requests tab
  const requestCount = friendRequests.incoming.length;

  // If a profile userId is provided, show the profile page
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
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

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
              <span className="notification-badge">{requestCount}</span>
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

        <div className="tab-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading community data...</p>
            </div>
          ) : (
            <>
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

        <div className="community-info">
          <div className="info-box">
            <h3>Benefits of Learning Together</h3>
            <ul>
              <li>Stay motivated by tracking your friends' progress</li>
              <li>Compete on the leaderboard for extra motivation</li>
              <li>Share language learning tips and experiences</li>
              <li>Find native speakers or language partners</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="community-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🌐</span>
            <span>Xlingo</span>
          </div>
          
          <div className="footer-links">
            <a href="#">Community Guidelines</a>
            <a href="#">Support</a>
            <a href="#">FAQ</a>
          </div>
          
          <div className="footer-social">
            <a href="#" className="social-link">📱</a>
            <a href="#" className="social-link">💬</a>
            <a href="#" className="social-link">📧</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            © 2025 Xlingo. All rights reserved.
          </div>
          
          <div className="footer-policies">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;