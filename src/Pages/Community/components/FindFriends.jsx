import React, { useState } from 'react';
import { API_URL } from '../../../config/index';

const FindFriends = ({ onSendRequest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentRequestIds, setSentRequestIds] = useState(new Set());
  const [error, setError] = useState(null);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('xlingoToken');
      const response = await fetch(`${API_URL}/community/users/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Ensure we store the complete MongoDB _id
        setSearchResults(data.users.map(user => ({
          ...user,
          id: user._id || user.id // Handle both _id and id fields
        })));
      } else {
        setError(data.message || 'Failed to search users');
      }
    } catch (err) {
      setError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle sending friend request
  const handleSendRequest = async (user) => {
    try {
      const token = localStorage.getItem('xlingoToken');
      const response = await fetch(`${API_URL}/community/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          targetUserId: user._id || user.id // Use the MongoDB _id
        })
      });

      const data = await response.json();
      if (data.success) {
        setSentRequestIds(prev => new Set([...prev, user._id || user.id]));
        onSendRequest(user);
      } else {
        setError(data.message || 'Failed to send friend request');
      }
    } catch (err) {
      setError('Failed to send friend request. Please try again.');
    }
  };

  return (
    <div className="find-friends">
      {error && <div className="error-message">{error}</div>}
      
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching}
          >
            <span className="search-icon">🔍</span>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      <div className="search-results">
        {searchQuery ? (
          <>
            <h3 className="results-title">
              {isSearching 
                ? "Searching..." 
                : `Search results for "${searchQuery}"`}
            </h3>

            {!isSearching && (
              <div className="results-list">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div className="user-card" key={user._id || user.id}>
                      <div className="user-avatar">
                        {user.profileImage 
                          ? <img src={user.profileImage} alt={user.username} /> 
                          : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h4 className="user-name">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username}
                        </h4>
                        <p className="user-username">@{user.username}</p>
                      </div>
                      <div className="user-actions">
                        {sentRequestIds.has(user._id || user.id) ? (
                          <button className="action-button pending" disabled>
                            <span className="action-icon">✓</span>
                            Request Sent
                          </button>
                        ) : (
                          <button 
                            className="action-button add-friend"
                            onClick={() => handleSendRequest(user)}
                          >
                            <span className="action-icon">+</span>
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <p className="no-results-message">No users found matching "{searchQuery}"</p>
                    <p className="no-results-hint">Try a different search term or check the spelling</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="search-suggestions">
            <h3 className="suggestions-title">Search Tips</h3>
            <ul className="suggestion-tips">
              <li>Search by username (e.g., "LanguageFan")</li>
              <li>Search by full name or partial name (e.g., "John" or "Smith")</li>
              <li>Try to be specific to find your friends more easily</li>
              <li>You can add friends to practice languages together!</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFriends;