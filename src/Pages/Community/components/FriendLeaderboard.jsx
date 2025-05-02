import React, { useState, useEffect } from 'react';

const FriendLeaderboard = ({ friends }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [sortBy, setSortBy] = useState('xp');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loading, setLoading] = useState(true);

  // Language options for the filter
  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'es', label: 'Spanish 🇪🇸' },
    { value: 'fr', label: 'French 🇫🇷' },
    { value: 'de', label: 'German 🇩🇪' },
    { value: 'it', label: 'Italian 🇮🇹' },
    { value: 'en', label: 'English 🇬🇧' },
  ];

  // Process the leaderboard data when friends, sortBy, or selectedLanguage changes
  useEffect(() => {
    if (!Array.isArray(friends)) {
      setLeaderboardData([]);
      setLoading(false);
      return;
    }

    // Add the current user to the leaderboard
    const currentUser = {
      id: 'current-user',
      username: 'You',
      firstName: 'You',
      lastName: '',
      profileImage: null,
      isCurrentUser: true,
      streak: { count: 7 }, // Example value
      learningProgress: [
        { language: 'es', xp: 1870, level: 5 },
        { language: 'fr', xp: 950, level: 3 }
      ]
    };

    // Combine friends and current user
    let allUsers = [...friends, currentUser];

    // Filter by language if needed
    if (selectedLanguage !== 'all') {
      allUsers = allUsers.filter(user => 
        user.learningProgress?.some(prog => prog.language === selectedLanguage)
      );
    }

    // Calculate the total XP or get language-specific XP for each user
    allUsers = allUsers.map(user => {
      let xp = 0;
      let level = 0;
      
      if (selectedLanguage === 'all') {
        // Sum XP across all languages
        xp = user.learningProgress?.reduce((sum, prog) => sum + prog.xp, 0) || 0;
        // Use average level across languages
        const levels = user.learningProgress?.map(prog => prog.level) || [];
        level = levels.length > 0 ? Math.round(levels.reduce((sum, l) => sum + l, 0) / levels.length) : 0;
      } else {
        // Get XP for the selected language
        const langProgress = user.learningProgress?.find(prog => prog.language === selectedLanguage);
        xp = langProgress?.xp || 0;
        level = langProgress?.level || 0;
      }
      
      return { ...user, calculatedXp: xp, calculatedLevel: level };
    });

    // Sort the users
    if (sortBy === 'xp') {
      allUsers.sort((a, b) => b.calculatedXp - a.calculatedXp);
    } else if (sortBy === 'streak') {
      allUsers.sort((a, b) => (b.streak?.count || 0) - (a.streak?.count || 0));
    }

    setLeaderboardData(allUsers);
    setLoading(false);
  }, [friends, sortBy, selectedLanguage]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard data...</p>
      </div>
    );
  }

  // Show empty state if no friends
  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="friend-leaderboard">
        <div className="leaderboard-header">
          <h2 className="leaderboard-title">Leaderboard</h2>
          <div className="leaderboard-filters">
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="xp">Sort by XP</option>
              <option value="streak">Sort by Streak</option>
            </select>
            <select 
              className="filter-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="empty-leaderboard">
          <div className="empty-icon">🏆</div>
          <p className="empty-message">No leaderboard data available</p>
          <p>Add friends to see how you compare!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friend-leaderboard">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <div className="leaderboard-filters">
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="xp">Sort by XP</option>
            <option value="streak">Sort by Streak</option>
          </select>
          <select 
            className="filter-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>XP</th>
            <th>Streak</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, index) => (
            <tr 
              key={user.id} 
              className={user.isCurrentUser ? 'current-user' : ''}
            >
              <td className="rank-cell">{index + 1}</td>
              <td className="user-cell">
                <div className="user-avatar">
                  {user.profileImage 
                    ? <img src={user.profileImage} alt={user.username} /> 
                    : user.username.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">
                  {user.isCurrentUser 
                    ? 'You' 
                    : (user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username)}
                </span>
              </td>
              <td className="xp-cell">{user.calculatedXp.toLocaleString()} XP</td>
              <td className="streak-cell">
                <span className="streak-icon">🔥</span>
                {user.streak?.count || 0} days
              </td>
              <td className="level-cell">
                <span className="level-badge">Level {user.calculatedLevel}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FriendLeaderboard;