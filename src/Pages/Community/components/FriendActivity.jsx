import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const FriendActivity = ({ friends }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Generate mock activities when component mounts
  useEffect(() => {
    if (!Array.isArray(friends) || friends.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Generate random activities for the friends
    const generateActivities = () => {
      // Activity types
      const activityTypes = [
        'lesson-completed',
        'streak-milestone',
        'level-up',
        'achievement'
      ];

      // Languages
      const languages = [
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
      ];

      // Lesson names
      const lessonNames = [
        'Basic Phrases', 
        'Food & Dining', 
        'Travel Vocabulary', 
        'Everyday Conversations',
        'Grammar Essentials',
        'Business Vocabulary',
        'Cultural Expressions',
        'Idioms & Slang'
      ];

      // Generate a random timestamp within the last week
      const randomTimestamp = () => {
        const now = new Date();
        const randomMs = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
        return new Date(now.getTime() - randomMs);
      };

      // Generate several activities per friend
      const allActivities = [];
      
      friends.forEach(friend => {
        // Get friend's primary language
        const primaryLanguage = friend.learningProgress && friend.learningProgress.length > 0
          ? friend.learningProgress[0]
          : { language: 'en', level: 1, xp: 100 };
          
        const language = languages.find(l => l.code === primaryLanguage.language) || languages[0];

        // Generate 1-3 random activities per friend
        const numActivities = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numActivities; i++) {
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          const timestamp = randomTimestamp();
          
          let activityDetails;
          
          switch (activityType) {
            case 'lesson-completed':
              const lessonName = lessonNames[Math.floor(Math.random() * lessonNames.length)];
              const xpEarned = Math.floor(Math.random() * 20) + 10;
              
              activityDetails = {
                message: `completed the "${lessonName}" lesson in ${language.name}`,
                xp: xpEarned,
                language: language
              };
              break;
              
            case 'streak-milestone':
              // Use the friend's actual streak
              const streakDays = friend.streak?.count || Math.floor(Math.random() * 50) + 5;
              
              activityDetails = {
                message: `reached a ${streakDays}-day streak milestone!`,
                streak: streakDays,
                language: language
              };
              break;
              
            case 'level-up':
              // Use the friend's actual level
              const newLevel = primaryLanguage.level || Math.floor(Math.random() * 8) + 2;
              
              activityDetails = {
                message: `reached Level ${newLevel} in ${language.name}`,
                level: newLevel,
                language: language
              };
              break;
              
            case 'achievement':
              const achievements = [
                'Perfect Week', 
                'Vocabulary Master', 
                'Grammar Guru', 
                'Consistent Learner',
                'Quick Thinker',
                'Pronunciation Pro',
                'Translation Expert'
              ];
              const achievement = achievements[Math.floor(Math.random() * achievements.length)];
              
              activityDetails = {
                message: `earned the "${achievement}" achievement`,
                achievement: achievement,
                language: language
              };
              break;
              
            default:
              activityDetails = {
                message: `practiced ${language.name}`,
                language: language
              };
          }
          
          allActivities.push({
            id: `${friend.id}-${i}-${timestamp.getTime()}`,
            user: friend,
            type: activityType,
            timestamp: timestamp,
            ...activityDetails
          });
        }
      });
      
      // Sort activities by timestamp (newest first)
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      return allActivities;
    };

    // Simulate API call with setTimeout
    setTimeout(() => {
      const mockActivities = generateActivities();
      setActivities(mockActivities);
      setLoading(false);
    }, 800);
  }, [friends]);

  // Filter activities based on selected filter
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading activity feed...</p>
      </div>
    );
  }

  // Show empty state if no activities
  if (!filteredActivities || filteredActivities.length === 0) {
    return (
      <div className="friend-activity">
        <div className="activity-header">
          <h2 className="activity-title">Activity Feed</h2>
          <select 
            className="filter-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="lesson-completed">Lessons</option>
            <option value="streak-milestone">Streaks</option>
            <option value="level-up">Level Ups</option>
            <option value="achievement">Achievements</option>
          </select>
        </div>

        <div className="empty-activity">
          <div className="empty-icon">📊</div>
          <p className="empty-message">No activity to show</p>
          <p className="empty-submessage">
            {filter === 'all' 
              ? "Add friends to see their learning activities here" 
              : "Try selecting a different filter"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="friend-activity">
      <div className="activity-header">
        <h2 className="activity-title">Activity Feed</h2>
        <select 
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Activities</option>
          <option value="lesson-completed">Lessons</option>
          <option value="streak-milestone">Streaks</option>
          <option value="level-up">Level Ups</option>
          <option value="achievement">Achievements</option>
        </select>
      </div>

      <div className="activity-feed">
        {filteredActivities.map(activity => (
          <div key={activity.id} className={`activity-item ${activity.type}`}>
            <div className="activity-header">
              <div className="user-avatar">
                {activity.user.profileImage 
                  ? <img src={activity.user.profileImage} alt={activity.user.username} /> 
                  : activity.user.username.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">
                {activity.user.firstName && activity.user.lastName 
                  ? `${activity.user.firstName} ${activity.user.lastName}` 
                  : activity.user.username}
              </span>
              <span className="activity-type">
                {activity.type === 'lesson-completed' && ' completed a lesson'}
                {activity.type === 'streak-milestone' && ' reached a streak milestone'}
                {activity.type === 'level-up' && ' leveled up'}
                {activity.type === 'achievement' && ' earned an achievement'}
              </span>
              <span className="activity-time">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </div>
            <div className="activity-content">
              <p className="activity-message">
                {activity.message}
              </p>
              <div className="activity-details">
                {activity.xp && (
                  <span className="detail-item xp">
                    <span className="detail-icon">⭐</span>
                    +{activity.xp} XP
                  </span>
                )}
                {activity.streak && (
                  <span className="detail-item streak">
                    <span className="detail-icon">🔥</span>
                    {activity.streak} days
                  </span>
                )}
                {activity.language && (
                  <span className="detail-item language">
                    <span className="flag-icon">{activity.language.flag}</span>
                    {activity.language.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendActivity;