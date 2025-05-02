import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaFire, FaMedal, FaCalendarAlt, FaBookOpen, FaUserFriends } from 'react-icons/fa';
import './FriendProfile.scss';

const FriendProfile = () => {
  const { id } = useParams();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');

  useEffect(() => {
    // Simulating API call to fetch friend details
    const fetchFriendData = async () => {
      try {
        // In a real app, this would be an API call like:
        // const response = await fetch(`/api/friends/${id}`);
        // const data = await response.json();
        
        // For demo purposes, using mock data
        setTimeout(() => {
          const mockFriend = {
            id: parseInt(id),
            name: "Maria Garcia",
            username: "mariaspeak",
            avatar: null,
            bio: "Language enthusiast on a journey to fluency in multiple languages. Love connecting with fellow language learners!",
            location: "Barcelona, Spain",
            joinDate: "2023-07-20",
            email: "maria.garcia@example.com",
            streak: 42,
            totalXP: 24500,
            lastActive: "2023-05-01T14:15:00",
            level: 12,
            achievements: [
              { id: 1, title: "Vocabulary Master", description: "Learned 1000 words", date: "2023-09-15", icon: "🏆" },
              { id: 2, title: "Streak Champion", description: "Maintained a 30-day streak", date: "2023-11-10", icon: "🔥" },
              { id: 3, title: "Grammar Guru", description: "Completed all grammar lessons", date: "2024-01-20", icon: "📚" },
              { id: 4, title: "Conversation Pro", description: "Completed 50 speaking exercises", date: "2024-03-05", icon: "🗣️" }
            ],
            languages: [
              { 
                id: "en", 
                name: "English", 
                flag: "🇺🇸", 
                level: 8, 
                progress: 90,
                stats: {
                  vocabulary: { total: 2500, learned: 2250 },
                  grammar: { total: 50, completed: 45 },
                  speaking: { total: 30, completed: 27 },
                  listening: { total: 40, completed: 36 }
                },
                recentActivities: [
                  { date: "2023-05-01", activity: "Completed Advanced Phrasal Verbs lesson", xp: 20 },
                  { date: "2023-04-30", activity: "Practiced speaking with 5 conversation exercises", xp: 50 },
                  { date: "2023-04-29", activity: "Reviewed past tense forms", xp: 15 }
                ]
              },
              { 
                id: "it", 
                name: "Italian", 
                flag: "🇮🇹", 
                level: 5, 
                progress: 60,
                stats: {
                  vocabulary: { total: 1500, learned: 900 },
                  grammar: { total: 40, completed: 24 },
                  speaking: { total: 25, completed: 15 },
                  listening: { total: 30, completed: 18 }
                },
                recentActivities: [
                  { date: "2023-04-28", activity: "Learned food vocabulary", xp: 25 },
                  { date: "2023-04-27", activity: "Practiced present perfect tense", xp: 30 },
                  { date: "2023-04-26", activity: "Listened to beginner dialog exercises", xp: 15 }
                ]
              }
            ],
            friends: 24,
            mutualFriends: [
              { id: 101, name: "David Lee", username: "polyglotdave", avatar: null },
              { id: 102, name: "Sophie Martin", username: "sophielingua", avatar: null },
              { id: 103, name: "Ahmed Hassan", username: "ahmedtongue", avatar: null }
            ],
            recentActivity: [
              { date: "2023-05-01", activity: "Completed English Advanced Phrasal Verbs", xp: 20 },
              { date: "2023-05-01", activity: "Earned achievement: 'Perfect Week'", xp: 30 },
              { date: "2023-04-30", activity: "Completed 5 Italian speaking exercises", xp: 50 },
              { date: "2023-04-30", activity: "Added new friend: Carlos Rodriguez", xp: 10 },
              { date: "2023-04-29", activity: "Learned 20 new Italian vocabulary words", xp: 40 },
              { date: "2023-04-29", activity: "Reviewed English past tense forms", xp: 15 },
              { date: "2023-04-28", activity: "Reached Level 5 in Italian", xp: 100 }
            ]
          };
          
          setFriend(mockFriend);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError("Could not load friend profile. Please try again.");
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return formatDate(dateString);
    }
  };

  const renderLanguageProgressBar = (language) => {
    return (
      <div key={language.id} className="language-card">
        <div className="language-header">
          <span className="language-flag">{language.flag}</span>
          <h3 className="language-name">{language.name}</h3>
          <span className="language-level">Level {language.level}</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${language.progress}%` }}
          ></div>
          <span className="progress-text">{language.progress}%</span>
        </div>
        
        <div className="language-stats">
          <div className="stat">
            <span className="stat-label">Vocabulary</span>
            <div className="stat-progress">
              <div 
                className="stat-fill"
                style={{ width: `${(language.stats.vocabulary.learned / language.stats.vocabulary.total) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{language.stats.vocabulary.learned}/{language.stats.vocabulary.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Grammar</span>
            <div className="stat-progress">
              <div 
                className="stat-fill"
                style={{ width: `${(language.stats.grammar.completed / language.stats.grammar.total) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{language.stats.grammar.completed}/{language.stats.grammar.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Speaking</span>
            <div className="stat-progress">
              <div 
                className="stat-fill"
                style={{ width: `${(language.stats.speaking.completed / language.stats.speaking.total) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{language.stats.speaking.completed}/{language.stats.speaking.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Listening</span>
            <div className="stat-progress">
              <div 
                className="stat-fill"
                style={{ width: `${(language.stats.listening.completed / language.stats.listening.total) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{language.stats.listening.completed}/{language.stats.listening.total}</span>
          </div>
        </div>
        
        <div className="recent-language-activity">
          <h4>Recent Activity</h4>
          <ul className="activity-list">
            {language.recentActivities.map((activity, index) => (
              <li key={index} className="activity-item">
                <div className="activity-date">{formatActivityDate(activity.date)}</div>
                <div className="activity-content">
                  <p className="activity-text">{activity.activity}</p>
                  <span className="activity-xp">+{activity.xp} XP</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="friend-profile-container loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friend-profile-container error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <Link to="/community" className="back-button">
            <FaArrowLeft /> Back to Community
          </Link>
        </div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="friend-profile-container">
        <div className="not-found-container">
          <div className="not-found-icon">🔍</div>
          <h2 className="not-found-title">Friend Not Found</h2>
          <p className="not-found-message">We couldn't find the profile you're looking for.</p>
          <Link to="/community" className="back-button">
            <FaArrowLeft /> Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="friend-profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back
        </button>

        <div className="friend-basics">
          <div className="friend-info">
            <div className="friend-avatar">
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.name} />
              ) : (
                friend.name.charAt(0).toUpperCase()
              )}
              <div className="level-badge">Lvl {friend.level}</div>
            </div>

            <div className="friend-details">
              <h1 className="friend-name">{friend.name}</h1>
              <p className="friend-username">@{friend.username}</p>
              <p className="description">{friend.bio}</p>

              <div className="friend-stats">
                <div className="stat-item">
                  <span className="stat-value">{friend.level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{friend.totalXP.toLocaleString()}</span>
                  <span className="stat-label">Total XP</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value streak">
                    <FaFire /> {friend.streak}
                  </span>
                  <span className="stat-label">Day Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{friend.languages.length}</span>
                  <span className="stat-label">Languages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <FaBookOpen /> Language Progress
          </button>
          <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <FaCalendarAlt /> Recent Activity
          </button>
          <button 
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <FaMedal /> Achievements
          </button>
          <button 
            className={`tab-button ${activeTab === 'mutual' ? 'active' : ''}`}
            onClick={() => setActiveTab('mutual')}
          >
            <FaUserFriends /> Mutual Friends
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'progress' && (
            <div className="language-section">
              <h3><FaBookOpen /> Language Progress</h3>
              <div className="language-grid">
                {friend.languages.map(language => (
                  <div key={language.id} className="language-card">
                    <div className="language-header">
                      <span className="language-flag">{language.flag}</span>
                      <div className="language-info">
                        <h4 className="language-name">{language.name}</h4>
                        <span className="language-level">Level {language.level}</span>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${language.progress}%` }}
                        ></div>
                      </div>

                      <div className="progress-stats">
                        {Object.entries(language.stats).map(([key, stat]) => (
                          <div key={key} className="stat-item">
                            <span className="stat-value">
                              {stat.completed || stat.learned}/{stat.total}
                            </span>
                            <span className="stat-label">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              <h3 className="tab-title">Recent Activity</h3>
              <ul className="activity-feed">
                {friend.recentActivity.map((activity, index) => (
                  <li key={index} className="activity-item">
                    <div className="activity-date">{formatActivityDate(activity.date)}</div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.activity}</p>
                      <span className="activity-xp">+{activity.xp} XP</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="achievements-tab">
              <h3 className="tab-title">Achievements</h3>
              <div className="achievements-grid">
                {friend.achievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">{achievement.title}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                      <span className="achievement-date">Earned on {formatDate(achievement.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'mutual' && (
            <div className="mutual-friends-tab">
              <h3 className="tab-title">Mutual Friends ({friend.mutualFriends.length})</h3>
              {friend.mutualFriends.length === 0 ? (
                <p className="no-mutual-friends">You don't have any mutual friends yet.</p>
              ) : (
                <div className="mutual-friends-grid">
                  {friend.mutualFriends.map(mutualFriend => (
                    <Link 
                      key={mutualFriend.id} 
                      to={`/community/profile/${mutualFriend.id}`}
                      className="mutual-friend-card"
                    >
                      <div className="mutual-friend-avatar">
                        {mutualFriend.avatar ? (
                          <img src={mutualFriend.avatar} alt={mutualFriend.name} />
                        ) : (
                          mutualFriend.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="mutual-friend-info">
                        <h4 className="mutual-friend-name">{mutualFriend.name}</h4>
                        <p className="mutual-friend-username">@{mutualFriend.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendProfile;