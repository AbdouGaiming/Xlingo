import React, { useState } from 'react';

const FindFriends = ({ onSendRequest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentRequestIds, setSentRequestIds] = useState(new Set());

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock search results
      const results = [
        {
          id: 6,
          username: "LanguageNerd",
          firstName: "David",
          lastName: "Chen",
          profileImage: null
        },
        {
          id: 7,
          username: "LearnDaily",
          firstName: "Sarah",
          lastName: "Jones",
          profileImage: null
        },
        {
          id: 8,
          username: "GlobalTalker",
          firstName: "James",
          lastName: "Wilson",
          profileImage: null
        }
      ].filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  // Handle sending friend request
  const handleSendRequest = (user) => {
    onSendRequest(user);
    setSentRequestIds(prev => new Set([...prev, user.id]));
  };

  return (
    <div className="find-friends">
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
                  searchResults.map(user => (
                    <div className="user-card" key={user.id}>
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
                        {sentRequestIds.has(user.id) ? (
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