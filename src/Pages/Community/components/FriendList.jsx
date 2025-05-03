import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaEye, FaUserMinus, FaSearch, FaSortAmountDown, FaFilter, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import './FriendList.scss';
import { API_URL } from '../../../config/index';

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [expandedView, setExpandedView] = useState(false);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  // Function to fetch friends
  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('xlingoToken');
      
      console.log('Fetching friends from:', `${API_URL}/community/friends`);
      
      const response = await fetch(`${API_URL}/community/friends`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Friends response status:', response.status);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Friends data received successfully');
        setFriends(data.friends || []);
        
        // Extract unique languages for the filter
        if (data.friends && data.friends.length > 0) {
          const allLanguages = data.friends.flatMap(friend => friend.languages || []);
          const uniqueLanguages = Array.from(new Set(allLanguages.map(lang => lang.id)))
            .map(id => {
              const lang = allLanguages.find(l => l.id === id);
              return lang ? { id: lang.id, name: lang.name, flag: lang.flag } : null;
            }).filter(Boolean);
          
          setLanguages(uniqueLanguages);
        }
      } else {
        console.error('Failed to fetch friends:', data);
        setError(data.message || "Failed to load friends");
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError("Failed to load friends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch friends on component mount
  useEffect(() => {
    fetchFriends();
  }, []);

  // Show confirm dialog instead of window.confirm
  const confirmRemoveFriend = (friend) => {
    setFriendToDelete(friend);
    setShowConfirmDialog(true);
    setDeletionSuccess(false);
  };
  
  // Close the dialog without deleting
  const cancelRemoveFriend = () => {
    setShowConfirmDialog(false);
    setTimeout(() => {
      setFriendToDelete(null);
      setDeletionInProgress(false);
    }, 300); // Delay to allow animation to complete
  };

  // Handle removing a friend with proper API endpoint
  const handleRemoveFriend = async () => {
    if (!friendToDelete) return;
    
    try {
      setDeletionInProgress(true);
      const token = localStorage.getItem('xlingoToken');
      
      // Use the correct API endpoint (community/friends/:friendId)
      console.log('Removing friend with ID:', friendToDelete.id);
      const response = await fetch(`${API_URL}/community/friends/${friendToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Remove friend response status:', response.status);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Friend removed successfully');
        
        // Show success message briefly
        setDeletionSuccess(true);
        
        // Update the local state by removing the friend
        setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendToDelete.id));
        
        // Close dialog after showing success
        setTimeout(() => {
          setShowConfirmDialog(false);
          setTimeout(() => {
            setFriendToDelete(null);
            setDeletionInProgress(false);
            setDeletionSuccess(false);
          }, 300);
        }, 1000);
      } else {
        console.error('Failed to remove friend:', data);
        setError(data.message || "Failed to remove friend");
        setDeletionInProgress(false);
        // Clear the error after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError("Failed to remove friend. Please try again.");
      setDeletionInProgress(false);
      // Clear the error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

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
      const searchMatch = (friend.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (friend.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (friend.username || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by language
      const languageMatch = filterLanguage === 'all' || 
                           (friend.languages || friend.learningProgress || []).some(lang => 
                             (lang.id === filterLanguage) || (lang.language === filterLanguage)
                           );
      
      return searchMatch && languageMatch;
    })
    .sort((a, b) => {
      // Sort based on selected criteria
      switch(sortBy) {
        case 'name':
          const nameA = a.firstName ? `${a.firstName} ${a.lastName || ''}` : a.username;
          const nameB = b.firstName ? `${b.firstName} ${b.lastName || ''}` : b.username;
          return nameA.localeCompare(nameB);
        case 'xp':
          return (b.totalXP || 0) - (a.totalXP || 0);
        case 'streak':
          return ((b.streak?.count) || 0) - ((a.streak?.count) || 0);
        case 'recent':
          return new Date(b.lastActive || b.lastLogin || 0) - new Date(a.lastActive || a.lastLogin || 0);
        case 'level':
          return (b.level || 0) - (a.level || 0);
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
      {/* Custom confirmation dialog */}
      {showConfirmDialog && friendToDelete && (
        <div className="friend-delete-overlay" onClick={cancelRemoveFriend}>
          <div className="friend-delete-dialog" onClick={(e) => e.stopPropagation()}>
            {!deletionSuccess ? (
              <>
                <div className="dialog-icon">
                  <FaExclamationTriangle />
                </div>
                <h3 className="dialog-title">Remove Friend</h3>
                <p className="dialog-message">
                  Are you sure you want to remove <strong>{friendToDelete.firstName || friendToDelete.username}</strong> from your friends list?
                </p>
                <div className="dialog-buttons">
                  <button 
                    className="dialog-button cancel" 
                    onClick={cancelRemoveFriend}
                    disabled={deletionInProgress}
                  >
                    <FaTimes className="button-icon" /> Cancel
                  </button>
                  <button 
                    className="dialog-button confirm" 
                    onClick={handleRemoveFriend}
                    disabled={deletionInProgress}
                  >
                    {deletionInProgress ? (
                      <>
                        <div className="button-spinner"></div> Removing...
                      </>
                    ) : (
                      <>
                        <FaUserMinus className="button-icon" /> Remove
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="deletion-success">
                <div className="success-icon">
                  <FaCheck />
                </div>
                <h3 className="success-title">Friend Removed</h3>
                <p className="success-message">
                  {friendToDelete.firstName || friendToDelete.username} has been removed from your friends list.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="friend-info">
                  <h3 className="friend-name">
                    {friend.firstName && friend.lastName 
                      ? `${friend.firstName} ${friend.lastName}`
                      : friend.username}
                  </h3>
                  <p className="friend-username">@{friend.username}</p>
                  <p className="friend-since">Friends since {formatDate(friend.since || friend.friendshipDate)}</p>
                </div>
              </div>
              
              <div className="friend-stats">
                <div className="stat-item level">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{friend.level || 1}</span>
                </div>
                <div className="stat-item xp">
                  <span className="stat-label">Total XP</span>
                  <span className="stat-value">{(friend.totalXP || 0).toLocaleString()}</span>
                </div>
                <div className="stat-item streak">
                  <span className="stat-label">Current Streak</span>
                  <span className="stat-value">
                    <FaFire className="streak-icon" /> {friend.streak?.count || 0} days
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Active</span>
                  <span className="stat-value">{formatDate(friend.lastActive || friend.lastLogin || new Date())}</span>
                </div>
              </div>
              
              {expandedView && (
                <div className="language-progress-container">
                  <h4>Language Progress</h4>
                  {(friend.languages || friend.learningProgress || []).map(language => (
                    <div key={language.id || language.language} className="language-progress">
                      <div className="language-title">
                        <span className="language-flag">
                          {language.flag || 
                            (language.language === 'es' ? '🇪🇸' : 
                             language.language === 'fr' ? '🇫🇷' : 
                             language.language === 'de' ? '🇩🇪' : 
                             language.language === 'it' ? '🇮🇹' : 
                             language.language === 'en' ? '🇬🇧' : '🌍')}
                        </span>
                        <span className="language-name">
                          {language.name || 
                            (language.language === 'es' ? 'Spanish' : 
                             language.language === 'fr' ? 'French' : 
                             language.language === 'de' ? 'German' : 
                             language.language === 'it' ? 'Italian' : 
                             language.language === 'en' ? 'English' : language.language)}
                        </span>
                        <span className="language-level">Level {language.level}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${language.progress || (language.xp / 100)}%` }}
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
                <button 
                  className="action-button remove-friend"
                  onClick={() => confirmRemoveFriend(friend)}
                >
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