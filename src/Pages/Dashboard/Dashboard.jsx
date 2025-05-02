import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.scss";

const Dashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState({
    id: "es",
    name: "Spanish",
    flag: "🇪🇸",
    level: 3,
    streak: 7,
    xp: 540,
    nextLevelXp: 750,
    dailyGoal: 50,
    dailyProgress: 30,
  });

  // References for scroll buttons
  const activitiesContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Load user data and selected language from localStorage on component mount
  useEffect(() => {
    const userFromStorage = localStorage.getItem("xlingoUser");
    if (userFromStorage) {
      const user = JSON.parse(userFromStorage);
      if (user.currentLanguage) {
        // Merge stored language with defaults for any missing properties
        setCurrentLanguage({
          ...currentLanguage,
          ...user.currentLanguage,
        });
      }
    }
  }, []);

  // Check scroll position to show/hide scroll buttons
  useEffect(() => {
    const checkScroll = () => {
      const container = activitiesContainerRef.current;
      if (!container) return;

      setShowLeftScroll(container.scrollLeft > 20);
      setShowRightScroll(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 20
      );
    };

    const container = activitiesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();

      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  // Scroll activities horizontally
  const scrollActivities = (direction) => {
    const container = activitiesContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Mock data for demonstration
  const learningActivities = [
    {
      id: 1,
      type: "vocabulary",
      title: "Food & Dining",
      progress: 70,
      totalWords: 30,
      completed: 21,
      timeEstimate: "5 min",
      isRecommended: true,
    },
    {
      id: 2,
      type: "grammar",
      title: "Present Tense",
      progress: 45,
      exercises: 20,
      completed: 9,
      timeEstimate: "10 min",
    },
    {
      id: 3,
      type: "listening",
      title: "Basic Conversations",
      progress: 20,
      duration: "15 min",
      completed: "3 min",
      timeEstimate: "7 min",
    },
    {
      id: 4,
      type: "speaking",
      title: "Introductions",
      progress: 60,
      phrases: 15,
      completed: 9,
      timeEstimate: "8 min",
      isNew: true,
    },
    {
      id: 5,
      type: "vocabulary",
      title: "Travel Words",
      progress: 35,
      totalWords: 40,
      completed: 14,
      timeEstimate: "6 min",
    },
    {
      id: 6,
      type: "grammar",
      title: "Past Tense",
      progress: 15,
      exercises: 25,
      completed: 4,
      timeEstimate: "15 min",
    },
  ];

  const challengesData = [
    {
      id: 1,
      title: "Weekend Warrior",
      description: "Complete 3 lessons on Saturday and Sunday",
      xp: 50,
      completed: false,
    },
    {
      id: 2,
      title: "Perfect Week",
      description: "Maintain your streak for 7 days",
      xp: 100,
      completed: false,
    },
    {
      id: 3,
      title: "Vocabulary Master",
      description: "Learn 50 new words this week",
      xp: 75,
      completed: true,
    },
    {
      id: 4,
      title: "Grammar Guru",
      description: "Complete all grammar exercises with 90% accuracy",
      xp: 120,
      completed: false,
    },
    {
      id: 5,
      title: "Early Bird",
      description: "Practice before 9am for 3 consecutive days",
      xp: 40,
      completed: true,
    },
  ];

  const leaderboardData = [
    { id: 1, name: "LingoMaster", xp: 2340, avatar: "👨‍🎓" },
    { id: 2, name: "PolyglotPro", xp: 2105, avatar: "👩‍🎓" },
    { id: 3, name: "You", xp: 1870, avatar: "😎", isCurrentUser: true },
    { id: 4, name: "LanguageFan", xp: 1650, avatar: "🧑‍💻" },
    { id: 5, name: "WordWizard", xp: 1520, avatar: "🧙‍♂️" },
  ];

  // Calculate XP progress percentage
  const xpProgressPercentage =
    (currentLanguage.xp / currentLanguage.nextLevelXp) * 100;
  const dailyProgressPercentage =
    (currentLanguage.dailyProgress / currentLanguage.dailyGoal) * 100;

  // Get appropriate icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "vocabulary":
        return "📚";
      case "grammar":
        return "📝";
      case "listening":
        return "🎧";
      case "speaking":
        return "🎤";
      case "reading":
        return "📖";
      case "writing":
        return "✍️";
      default:
        return "🎯";
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome back, Language Learner!</h1>
          <p>Continue your language journey today</p>
        </div>
        <div className="current-language">
          <div className="language-flag">{currentLanguage.flag}</div>
          <div className="language-info">
            <h2>{currentLanguage.name}</h2>
            <div className="level-badge">Level {currentLanguage.level}</div>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Progress Section */}
        <section className="progress-section">
          <div className="section-header">
            <h3>Your Progress</h3>
          </div>

          <div className="progress-stats">
            <div className="progress-card streak">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <h4>{currentLanguage.streak} day streak</h4>
                <p>Keep it going!</p>
              </div>
            </div>

            <div className="progress-card xp">
              <h4>XP Progress</h4>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${xpProgressPercentage}%` }}
                ></div>
              </div>
              <div className="progress-details">
                <span>{currentLanguage.xp} XP</span>
                <span>{currentLanguage.nextLevelXp} XP</span>
              </div>
              <p>Keep earning XP to reach level {currentLanguage.level + 1}</p>
            </div>

            <div className="progress-card daily-goal">
              <h4>Daily Goal</h4>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${dailyProgressPercentage}%` }}
                ></div>
              </div>
              <div className="progress-details">
                <span>{currentLanguage.dailyProgress} XP today</span>
                <span>Goal: {currentLanguage.dailyGoal} XP</span>
              </div>
              <p>
                You need{" "}
                {currentLanguage.dailyGoal - currentLanguage.dailyProgress} more
                XP to reach your daily goal
              </p>
            </div>
          </div>
        </section>

        {/* Activities Section - Enhanced Horizontal */}
        <section className="activities-section">
          <div className="section-header">
            <h3>Continue Learning</h3>
            <Link to="/lessons" className="see-all-link">
              See all lessons
            </Link>
          </div>

          <div className="activities-carousel">
            {showLeftScroll && (
              <button
                className="scroll-button left"
                onClick={() => scrollActivities("left")}
                aria-label="Scroll left"
              >
                ◀
              </button>
            )}

            <div className="activities-grid" ref={activitiesContainerRef}>
              {learningActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`activity-card ${activity.type}`}
                >
                  <div className="activity-card-content">
                    <div className={`activity-icon ${activity.type}-icon`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-info">
                      <div className="activity-header">
                        <h4>{activity.title}</h4>
                        {activity.isRecommended && (
                          <span className="activity-badge recommended">
                            Recommended
                          </span>
                        )}
                        {activity.isNew && (
                          <span className="activity-badge new">New</span>
                        )}
                      </div>
                      <div className="activity-progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${activity.progress}%` }}
                        ></div>
                      </div>
                      <div className="activity-stats">
                        <p className="activity-details">
                          {activity.type === "vocabulary" &&
                            `${activity.completed}/${activity.totalWords} words`}
                          {activity.type === "grammar" &&
                            `${activity.completed}/${activity.exercises} exercises`}
                          {activity.type === "listening" &&
                            `${activity.completed}/${activity.duration}`}
                          {activity.type === "speaking" &&
                            `${activity.completed}/${activity.phrases} phrases`}
                        </p>
                        <span className="time-estimate">
                          <span className="time-icon">⏱️</span>{" "}
                          {activity.timeEstimate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/practice/${activity.type}/${activity.id}`}
                    className="continue-button"
                  >
                    Continue
                  </Link>
                </div>
              ))}
            </div>

            {showRightScroll && (
              <button
                className="scroll-button right"
                onClick={() => scrollActivities("right")}
                aria-label="Scroll right"
              >
                ▶
              </button>
            )}
          </div>

          <div className="carousel-indicators">
            <div className="carousel-dots">
              {[...Array(Math.ceil(learningActivities.length / 3))].map(
                (_, i) => (
                  <button
                    key={i}
                    className={`carousel-dot ${i === 0 ? "active" : ""}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section className="challenges-section">
          <div className="section-header">
            <h3>Challenges</h3>
            <Link to="/challenges" className="see-all-link">
              See all
            </Link>
          </div>

          <div className="challenges-list">
            {challengesData.map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-card ${
                  challenge.completed ? "completed" : ""
                }`}
              >
                <div className="challenge-icon">
                  {challenge.completed ? "🏆" : "🎯"}
                </div>
                <div className="challenge-info">
                  <h4>{challenge.title}</h4>
                  <p>{challenge.description}</p>
                  <div className="challenge-reward">
                    <span className="xp-reward">+{challenge.xp} XP</span>
                    {challenge.completed && (
                      <span className="completed-badge">Completed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="leaderboard-section">
          <div className="section-header">
            <h3>Leaderboard</h3>
            <Link to="/community" className="see-all-link">
              View Community
            </Link>
          </div>

          <div className="leaderboard-list">
            {leaderboardData.map((user, index) => (
              <div
                key={user.id}
                className={`leaderboard-item ${
                  user.isCurrentUser ? "current-user" : ""
                }`}
              >
                <div className="rank">{index + 1}</div>
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-name">{user.name}</div>
                <div className="user-xp">{user.xp} XP</div>
              </div>
            ))}
          </div>
          <div className="leaderboard-footer">
            <p>Keep learning to climb the ranks!</p>
          </div>
        </section>
      </div>

      <div className="quick-actions">
        <Link to="/practice/vocabulary" className="action-button practice-btn">
          <span className="action-icon">🎯</span>
          <span className="action-text">Vocabulary Practice</span>
        </Link>
        <Link to="/select-language" className="action-button lesson-btn">
          <span className="action-icon">🌍</span>
          <span className="action-text">Change Language</span>
        </Link>
        <Link to="/community/chat" className="action-button community-btn">
          <span className="action-icon">👥</span>
          <span className="action-text">Language Partners</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
