import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaEye, FaUserMinus, FaSearch, FaSortAmountDown, FaFilter } from 'react-icons/fa';
import './FriendList.scss';

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, xp, streak, recent
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch friends
    const fetchFriends = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          const mockFriends = [
            {
              id: 1,
              name: "John Smith",
              username: "linguajohn",
              avatar: null,
              streak: 27,
              totalXP: 15240,
              since: "2023-09-15",
              lastActive: "2023-05-01T08:30:00",
              level: 9,
              languages: [
                { id: "es", name: "Spanish", flag: "🇪🇸", level: 7, progress: 85 },
                { id: "fr", name: "French", flag: "🇫🇷", level: 3, progress: 45 }
              ]
            },
            {
              id: 2,
              name: "Maria Garcia",
              username: "mariaspeak",
              avatar: null,
              streak: 42,
              totalXP: 24500,
              since: "2023-07-20",
              lastActive: "2023-05-01T14:15:00",
              level: 12,
              languages: [
                { id: "en", name: "English", flag: "🇺🇸", level: 8, progress: 90 },
                { id: "it", name: "Italian", flag: "🇮🇹", level: 5, progress: 60 }
              ]
            },
            {
              id: 3,
              name: "David Lee",
              username: "polyglotdave",
              avatar: null,
              streak: 12,
              totalXP: 8340,
              since: "2023-12-05",
              lastActive: "2023-04-30T19:45:00",
              level: 6,
              languages: [
                { id: "ja", name: "Japanese", flag: "🇯🇵", level: 4, progress: 55 },
                { id: "ko", name: "Korean", flag: "🇰🇷", level: 2, progress: 30 }
              ]
            },
            {
              id: 4,
              name: "Sophie Martin",
              username: "sophielingua",
              avatar: null,
              streak: 63,
              totalXP: 31250,
              since: "2023-05-10",
              lastActive: "2023-05-01T21:05:00",
              level: 14,
              languages: [
                { id: "de", name: "German", flag: "🇩🇪", level: 9, progress: 95 },
                { id: "ru", name: "Russian", flag: "🇷🇺", level: 6, progress: 70 }
              ]
            },
            {
              id: 5,
              name: "Ahmed Hassan",
              username: "ahmedtongue",
              avatar: null,
              streak: 8,
              totalXP: 5120,
              since: "2024-01-12",
              lastActive: "2023-04-29T16:20:00",
              level: 4,
              languages: [
                { id: "ar", name: "Arabic", flag: "🇸🇦", level: 3, progress: 40 },
                { id: "fr", name: "French", flag: "🇫🇷", level: 1, progress: 15 }
              ]
            },
            {
              id: 6,
              name: "Emma Wilson",
              username: "emmaspeak",
              avatar: null,
              streak: 31,
              totalXP: 18720,
              since: "2023-08-22",
              lastActive: "2023-05-01T10:10:00",
              level: 10,
              languages: [
                { id: "es", name: "Spanish", flag: "🇪🇸", level: 6, progress: 75 },
                { id: "pt", name: "Portuguese", flag: "🇵🇹", level: 4, progress: 50 }
              ]
            },
            {
              id: 7,
              name: "Liu Wei",
              username: "liupolyglot",
              avatar: null,
              streak: 53,
              totalXP: 27880,
              since: "2023-06-14",
              lastActive: "2023-04-30T22:40:00",
              level: 13,
              languages: [
                { id: "en", name: "English", flag: "🇺🇸", level: 7, progress: 80 },
                { id: "fr", name: "French", flag: "🇫🇷", level: 6, progress: 65 }
              ]
            },
            {
              id: 8,
              name: "Anna Kowalski",
              username: "annatalk",
              avatar: null,
              streak: 19,
              totalXP: 10680,
              since: "2023-10-30",
              lastActive: "2023-05-01T13:25:00",
              level: 7,
              languages: [
                { id: "de", name: "German", flag: "🇩🇪", level: 5, progress: 60 },
                { id: "ru", name: "Russian", flag: "🇷🇺", level: 3, progress: 35 }
              ]
            }
          ];

          setFriends(mockFriends);
          
          // Extract unique languages for the filter
          const allLanguages = mockFriends.flatMap(friend => friend.languages);
          const uniqueLanguages = Array.from(new Set(allLanguages.map(lang => lang.id)))
            .map(id => {
              const lang = allLanguages.find(l => l.id === id);
              return { id: lang.id, name: lang.name, flag: lang.flag };
            });
          
          setLanguages(uniqueLanguages);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load friends. Please try again.");
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterLanguage(e.target.value);
  };

  const toggleView = () => {
    setExpandedView(!expandedView);
  };

  const filteredFriends = friends
    .filter(friend => {
      // Filter by search query
      const searchMatch = friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          friend.username.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by language
      const languageMatch = filterLanguage === 'all' || 
                           friend.languages.some(lang => lang.id === filterLanguage);
      
      return searchMatch && languageMatch;
    })
    .sort((a, b) => {
      // Sort based on selected criteria
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'xp':
          return b.totalXP - a.totalXP;
        case 'streak':
          return b.streak - a.streak;
        case 'recent':
          return new Date(b.lastActive) - new Date(a.lastActive);
        case 'level':
          return b.level - a.level;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your friends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="empty-friends">
        <div className="empty-icon">👥</div>
        <h3 className="empty-message">You don't have any friends yet</h3>
        <p className="empty-submessage">Add friends to see their progress and compete on the leaderboard</p>
        <button className="find-friends-button" onClick={() => window.location.href = '/community?tab=find-friends'}>
          Find Friends
        </button>
      </div>
    );
  }

  return (
    <div className="friend-list-container">
      <div className="friend-list-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search friends by name or username..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="sort-select">
              <FaSortAmountDown className="filter-icon" /> Sort by:
            </label>
            <select 
              id="sort-select" 
              value={sortBy} 
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="name">Name (A-Z)</option>
              <option value="xp">XP (Highest)</option>
              <option value="streak">Streak (Highest)</option>
              <option value="recent">Recently Active</option>
              <option value="level">Level (Highest)</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="language-select">
              <FaFilter className="filter-icon" /> Language:
            </label>
            <select 
              id="language-select" 
              value={filterLanguage} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button className="view-toggle-button" onClick={toggleView}>
            {expandedView ? "Compact View" : "Expanded View"}
          </button>
        </div>
      </div>

      {filteredFriends.length === 0 ? (
        <div className="no-results">
          <p>No friends match your search criteria. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={`friend-list ${expandedView ? 'expanded-view' : 'compact-view'}`}>
          {filteredFriends.map(friend => (
            <div key={friend.id} className="friend-card">
              <div className="friend-header">
                <div className="friend-avatar">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} />
                  ) : (
                    friend.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="friend-info">
                  <h3 className="friend-name">{friend.name}</h3>
                  <p className="friend-username">@{friend.username}</p>
                  <p className="friend-since">Friends since {formatDate(friend.since)}</p>
                </div>
              </div>
              
              <div className="friend-stats">
                <div className="stat-item level">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{friend.level}</span>
                </div>
                <div className="stat-item xp">
                  <span className="stat-label">Total XP</span>
                  <span className="stat-value">{friend.totalXP.toLocaleString()}</span>
                </div>
                <div className="stat-item streak">
                  <span className="stat-label">Current Streak</span>
                  <span className="stat-value">
                    <FaFire className="streak-icon" /> {friend.streak} days
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Active</span>
                  <span className="stat-value">{formatDate(friend.lastActive)}</span>
                </div>
              </div>
              
              {expandedView && (
                <div className="language-progress-container">
                  <h4>Language Progress</h4>
                  {friend.languages.map(language => (
                    <div key={language.id} className="language-progress">
                      <div className="language-title">
                        <span className="language-flag">{language.flag}</span>
                        <span className="language-name">{language.name}</span>
                        <span className="language-level">Level {language.level}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${language.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="friend-actions">
                <Link to={`/community/profile/${friend.id}`} className="action-button view-profile">
                  <FaEye className="action-icon" />
                  View Profile
                </Link>
                <button className="action-button remove-friend">
                  <FaUserMinus className="action-icon" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendList;