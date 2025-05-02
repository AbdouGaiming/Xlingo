import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.scss";

const Dashboard = () => {
  // State for user language data - default values for when no data exists
  const [currentLanguage, setCurrentLanguage] = useState({
    id: "es",
    name: "Spanish",
    flag: "🇪🇸",
    level: 1,
    streak: 0,
    xp: 0,
    nextLevelXp: 100,
    dailyGoal: 30,
    dailyProgress: 0,
  });

  // State for backend data
  const [loading, setLoading] = useState({
    achievements: true,
    activities: true,
    leaderboard: true,
    streakData: true,
    overall: true,
  });
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("Language Learner");
  const [challengesData, setChallengesData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [streakData, setStreakData] = useState(0);

  // References for scroll buttons
  const activitiesContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Configure axios defaults
  const API_BASE_URL = "http://localhost:8000/api";

  // Set up axios instance with auth token
  const setupAxios = (token) => {
    if (token) {
      console.log("Setting up axios with token");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  };

  // Load user data and selected language from localStorage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userFromStorage = localStorage.getItem("xlingoUser");
        if (!userFromStorage) {
          console.log("No user found in localStorage");
          setLoading({
            achievements: false,
            activities: false,
            leaderboard: false,
            streakData: false,
            overall: false,
          });
          return;
        }

        const user = JSON.parse(userFromStorage);
        console.log("User loaded from localStorage:", user._id);

        // Update user data in state
        if (user.currentLanguage) {
          setCurrentLanguage((prevLang) => ({
            ...prevLang,
            ...user.currentLanguage,
          }));
        }

        if (user._id) {
          setUserId(user._id);
        }

        if (user.token) {
          setToken(user.token);
          setupAxios(user.token);
        }

        if (user.username) {
          setUsername(user.username);
        }

        // Fetch data if we have the user ID
        if (user._id) {
          await fetchDashboardData(user._id, user.token || "");
        } else {
          setLoading({
            achievements: false,
            activities: false,
            leaderboard: false,
            streakData: false,
            overall: false,
          });
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data. Please try signing in again.");
        setLoading({
          achievements: false,
          activities: false,
          leaderboard: false,
          streakData: false,
          overall: false,
        });
      }
    };

    fetchUserData();
  }, []);

  // Fetch all dashboard data from backend
  const fetchDashboardData = async (userId, token) => {
    // Reset loading states
    setLoading({
      achievements: true,
      activities: true,
      leaderboard: true,
      streakData: true,
      overall: true,
    });
    setError(null);
    console.log(`Fetching dashboard data for user: ${userId}`);

    // Prepare headers for authenticated requests
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Using token for API requests");
    } else {
      console.warn("No token found, API requests might fail");
    }

    try {
      // Fetch achievements data
      try {
        console.log(
          `Fetching achievements from: ${API_BASE_URL}/achievements/user/${userId}`
        );
        const achievementsRes = await axios.get(
          `${API_BASE_URL}/achievements/user/${userId}`,
          { headers } // Pass headers explicitly
        );
        console.log(
          "Achievements API response status:",
          achievementsRes.status
        );
        // Log the raw data received
        console.log(
          "Raw achievements data received:",
          JSON.stringify(achievementsRes.data, null, 2)
        );

        const achievementsData = achievementsRes.data || [];
        console.log(
          "Received achievements data:",
          achievementsData.length,
          "items"
        );
        setAchievements(achievementsData);

        // Process achievement data for challenges section
        const challengesFromAchievements =
          processAchievementsForChallenges(achievementsData);
        console.log(
          "Processed challenges data:",
          challengesFromAchievements.length,
          "items"
        );
        // Log the processed data
        console.log(
          "Processed challenges for UI:",
          JSON.stringify(challengesFromAchievements, null, 2)
        );
        setChallengesData(challengesFromAchievements);
      } catch (error) {
        console.error(
          "Error fetching achievements:",
          error.response?.data || error.message
        );
        // Log the error object for more details
        console.error("Full error object:", error);
        setError("Failed to load achievements. Please try again.");
        // Set empty achievements array if fetch fails
        setAchievements([]);
        setChallengesData([]);
      } finally {
        setLoading((prev) => ({ ...prev, achievements: false }));
      }

      // Fetch specific streak milestone activities
      try {
        const streakRes = await axios.get(
          `${API_BASE_URL}/activities/type/${userId}/streak_milestone`,
          { headers } // Pass headers explicitly
        );
        const streakActivities = streakRes.data || [];

        // Get most recent streak milestone
        if (streakActivities.length > 0) {
          const latestStreak = streakActivities.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )[0];

          const currentStreak = latestStreak.details?.streakCount || 0;
          setStreakData(currentStreak);

          // Update language with streak data
          setCurrentLanguage((prev) => ({
            ...prev,
            streak: currentStreak,
          }));
        }
      } catch (error) {
        console.error(
          "Error fetching streak data:",
          error.response?.data || error.message
        );
        // Keep default streak value if fetch fails
      } finally {
        setLoading((prev) => ({ ...prev, streakData: false }));
      }

      // Fetch level up activities
      try {
        const levelRes = await axios.get(
          `${API_BASE_URL}/activities/type/${userId}/level_up`,
          { headers } // Pass headers explicitly
        );
        const levelActivities = levelRes.data || [];

        // Get most recent level up
        if (levelActivities.length > 0) {
          const latestLevel = levelActivities.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )[0];

          const currentLevel = latestLevel.details?.level || 1;

          // Update language with level data
          setCurrentLanguage((prev) => ({
            ...prev,
            level: currentLevel,
          }));
        }
      } catch (error) {
        console.error(
          "Error fetching level data:",
          error.response?.data || error.message
        );
        // Keep default level value if fetch fails
      }

      // Fetch all user activities for daily progress and XP
      try {
        const activitiesRes = await axios.get(
          `${API_BASE_URL}/activities/user/${userId}`,
          { headers } // Pass headers explicitly
        );
        const activitiesData = activitiesRes.data || [];
        setActivities(activitiesData);

        // Process activities for daily XP and total XP
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate daily XP
        const dailyXP = activitiesData
          .filter((activity) => {
            const activityDate = new Date(activity.timestamp);
            activityDate.setHours(0, 0, 0, 0);
            return (
              activityDate.getTime() === today.getTime() &&
              activity.details &&
              activity.details.xpEarned
            );
          })
          .reduce(
            (total, activity) => total + (activity.details.xpEarned || 0),
            0
          );

        // Calculate total XP
        const totalXP = activitiesData
          .filter((activity) => activity.details && activity.details.xpEarned)
          .reduce(
            (total, activity) => total + (activity.details.xpEarned || 0),
            0
          );

        // Update language with XP data
        setCurrentLanguage((prev) => ({
          ...prev,
          dailyProgress: dailyXP || 0,
          xp: totalXP || 0,
        }));

        // Process activities for display in learning section
        const processedActivities = processActivitiesData(activitiesData);
        setRecentActivities(processedActivities);
      } catch (error) {
        console.error(
          "Error fetching activities:",
          error.response?.data || error.message
        );
        setError("Failed to load learning activities.");
        // Set empty activities array if fetch fails
        setActivities([]);
        setRecentActivities([]);
      } finally {
        setLoading((prev) => ({ ...prev, activities: false }));
      }

      // Fetch leaderboard data
      try {
        const leaderboardRes = await axios.get(
          `${API_BASE_URL}/activities/leaderboard`,
          { headers } // Pass headers explicitly
        );
        const leaderboardData = leaderboardRes.data || [];
        const processedLeaderboard = processLeaderboardData(
          leaderboardData,
          userId
        );
        setLeaderboardData(processedLeaderboard);
      } catch (error) {
        console.error(
          "Error fetching leaderboard:",
          error.response?.data || error.message
        );
        setError("Failed to load leaderboard.");
        // Set empty leaderboard array if fetch fails
        setLeaderboardData([]);
      } finally {
        setLoading((prev) => ({ ...prev, leaderboard: false }));
      }

      // Update overall loading state
      setLoading((prev) => ({ ...prev, overall: false }));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      setLoading({
        achievements: false,
        activities: false,
        leaderboard: false,
        streakData: false,
        overall: false,
      });
    }
  };

  // Process activities data for the UI
  const processActivitiesData = (activitiesData) => {
    if (!activitiesData || activitiesData.length === 0) {
      return getDefaultActivities();
    }

    // Group activities by type and categorize for the learning activities section
    const processedActivities = [];

    // Calculate progress for lesson types
    const lessonTypes = [
      "vocabulary",
      "grammar",
      "listening",
      "speaking",
      "reading",
      "writing",
    ];

    // Create sample activities based on real user activities
    lessonTypes.forEach((type) => {
      const typeActivities = activitiesData.filter(
        (a) =>
          a.type === "lesson_complete" &&
          a.details &&
          a.details.lessonType === type
      );

      if (typeActivities.length > 0) {
        // Generate an activity card for this type
        processedActivities.push({
          id: type + "-1",
          type: type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Practice`,
          progress: Math.min(Math.floor(typeActivities.length * 10), 100),
          totalLessons: 10,
          completed: typeActivities.length,
          timeEstimate: "5 min",
          isRecommended: Math.random() > 0.7, // Randomly mark some as recommended
        });
      }
    });

    // If we don't have enough activities, add default ones
    if (processedActivities.length < 4) {
      const defaultActivities = getDefaultActivities();
      // Add default activities but avoid duplicates
      const existingTypes = processedActivities.map((a) => a.type);
      const missingActivities = defaultActivities.filter(
        (a) => !existingTypes.includes(a.type)
      );

      // Add missing activities until we have at least 4
      for (
        let i = 0;
        i < missingActivities.length && processedActivities.length < 4;
        i++
      ) {
        processedActivities.push(missingActivities[i]);
      }
    }

    return processedActivities;
  };

  // Get default activities for when no data exists
  const getDefaultActivities = () => {
    return [
      {
        id: "vocabulary-default",
        type: "vocabulary",
        title: "Vocabulary Practice",
        progress: 0,
        totalLessons: 10,
        completed: 0,
        timeEstimate: "5 min",
        isNew: true,
      },
      {
        id: "grammar-default",
        type: "grammar",
        title: "Grammar Basics",
        progress: 0,
        totalLessons: 10,
        completed: 0,
        timeEstimate: "10 min",
      },
      {
        id: "listening-default",
        type: "listening",
        title: "Listening Practice",
        progress: 0,
        totalLessons: 10,
        completed: 0,
        timeEstimate: "7 min",
      },
      {
        id: "speaking-default",
        type: "speaking",
        title: "Speaking Practice",
        progress: 0,
        totalLessons: 10,
        completed: 0,
        timeEstimate: "8 min",
        isRecommended: true,
      },
    ];
  };

  // Process achievements data into challenges format
  const processAchievementsForChallenges = (achievementsData) => {
    console.log("Processing achievements:", achievementsData.length);

    // If there's no data, return default challenges
    if (!achievementsData || achievementsData.length === 0) {
      console.log("No achievements data found, using defaults");
      return getDefaultChallenges();
    }

    // Log completed achievements
    const completedAchievements = achievementsData.filter((a) => a.isCompleted);
    console.log(`Found ${completedAchievements.length} completed achievements`);

    // Filter to show only relevant achievements as challenges
    // Sort by completion status then by rarity
    return achievementsData
      .filter(
        (achievement) =>
          !achievement.isSecret && achievement.category !== "milestone"
      )
      .sort((a, b) => {
        // First sort by completion status (incomplete first)
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }

        // Then by rarity (higher rarity first)
        const rarityOrder = {
          legendary: 0,
          epic: 1,
          rare: 2,
          uncommon: 3,
          common: 4,
        };

        return (
          rarityOrder[a.rarity || "common"] - rarityOrder[b.rarity || "common"]
        );
      })
      .slice(0, 5) // Take only the top 5 for the dashboard
      .map((achievement) => {
        return {
          id: achievement._id,
          title: achievement.name,
          description:
            achievement.description || "Complete this challenge to earn XP!",
          xp: achievement.xpReward || 10,
          completed: achievement.isCompleted || false,
          icon: achievement.icon || getDifficultyIcon(achievement.rarity),
        };
      });
  };

  // Get default challenges for when no data exists
  const getDefaultChallenges = () => {
    return [
      {
        id: "daily-streak",
        title: "Daily Streak",
        description: "Complete a lesson every day for 3 days",
        xp: 20,
        completed: false,
        icon: "🔥",
      },
      {
        id: "vocabulary-master",
        title: "Vocabulary Master",
        description: "Learn 50 new words",
        xp: 30,
        completed: false,
        icon: "📚",
      },
      {
        id: "perfect-score",
        title: "Perfect Score",
        description: "Complete a lesson with 100% accuracy",
        xp: 15,
        completed: false,
        icon: "🎯",
      },
      {
        id: "social-butterfly",
        title: "Social Butterfly",
        description: "Add 3 friends to your network",
        xp: 25,
        completed: false,
        icon: "🦋",
      },
      {
        id: "first-level",
        title: "First Level",
        description: "Reach level 2 in any language",
        xp: 40,
        completed: false,
        icon: "⭐",
      },
    ];
  };

  // Get icon based on achievement rarity
  const getDifficultyIcon = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "🏆";
      case "epic":
        return "⭐";
      case "rare":
        return "🥇";
      case "uncommon":
        return "🔶";
      case "common":
        return "🔵";
      default:
        return "🎯";
    }
  };

  // Format leaderboard data and mark current user
  const processLeaderboardData = (leaderboardUsers, currentUserId) => {
    if (!leaderboardUsers || leaderboardUsers.length === 0) {
      return getDefaultLeaderboard(currentUserId);
    }

    return leaderboardUsers.map((user) => ({
      id: user._id,
      name: user._id === currentUserId ? "You" : user.username || "User",
      xp: user.xp || 0,
      avatar: user.avatar || "👤",
      isCurrentUser: user._id === currentUserId,
    }));
  };

  // Get default leaderboard data when none exists
  const getDefaultLeaderboard = (currentUserId) => {
    return [
      {
        id: currentUserId || "you",
        name: "You",
        xp: 0,
        avatar: "👤",
        isCurrentUser: true,
      },
      {
        id: "user1",
        name: "LingoMaster",
        xp: 2540,
        avatar: "👨‍🎓",
      },
      {
        id: "user2",
        name: "LanguageExpert",
        xp: 1950,
        avatar: "👩‍🏫",
      },
      {
        id: "user3",
        name: "WordWizard",
        xp: 1600,
        avatar: "🧙‍♂️",
      },
      {
        id: "user4",
        name: "VocabHero",
        xp: 1200,
        avatar: "🦸‍♀️",
      },
    ];
  };

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

  // Use real or default activities
  const learningActivities = recentActivities;

  // Calculate XP progress percentage (prevent division by zero)
  const nextLevelXp = currentLanguage.nextLevelXp || 100;
  const xpProgressPercentage = Math.min(
    (currentLanguage.xp / nextLevelXp) * 100,
    100
  );

  // Calculate daily goal percentage (prevent division by zero)
  const dailyGoal = currentLanguage.dailyGoal || 30;
  const dailyProgressPercentage = Math.min(
    (currentLanguage.dailyProgress / dailyGoal) * 100,
    100
  );

  // Display error or loading state if needed
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => fetchDashboardData(userId, token)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome back, {username}!</h1>
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
                <p>
                  {currentLanguage.streak > 0
                    ? "Keep it going!"
                    : "Start your streak today!"}
                </p>
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
                <span>{nextLevelXp} XP</span>
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
                <span>Goal: {dailyGoal} XP</span>
              </div>
              <p>
                You need {dailyGoal - currentLanguage.dailyProgress} more XP to
                reach your daily goal
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
              {loading.activities ? (
                <div className="loading-indicator">Loading activities...</div>
              ) : learningActivities.length > 0 ? (
                learningActivities.map((activity) => (
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
                            {`${activity.completed}/${activity.totalLessons} lessons`}
                          </p>
                          <span className="time-estimate">
                            <span className="time-icon">⏱️</span>{" "}
                            {activity.timeEstimate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/practice/${activity.type}/1`}
                      className="continue-button"
                    >
                      Continue
                    </Link>
                  </div>
                ))
              ) : (
                <div className="no-activities">
                  <p>Start a lesson to see your learning activities here!</p>
                  <Link to="/lessons" className="start-lesson-btn">
                    Start Learning
                  </Link>
                </div>
              )}
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
            {loading.achievements ? (
              <div className="loading-indicator">Loading challenges...</div>
            ) : challengesData.length > 0 ? (
              challengesData.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`challenge-card ${
                    challenge.completed ? "completed" : ""
                  }`}
                >
                  <div className="challenge-icon">
                    {challenge.icon || (challenge.completed ? "🏆" : "🎯")}
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
              ))
            ) : (
              <div className="no-challenges">
                <p>Complete lessons to unlock challenges!</p>
              </div>
            )}
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
            {loading.leaderboard ? (
              <div className="loading-indicator">Loading leaderboard...</div>
            ) : leaderboardData.length > 0 ? (
              leaderboardData.map((user, index) => (
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
              ))
            ) : (
              <div className="no-leaderboard">
                <p>Start learning to appear on the leaderboard!</p>
              </div>
            )}
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
        <Link to="/lessons" className="action-button lesson-btn">
          <span className="action-icon">🌴</span>
          <span className="action-text">Adventure Lessons</span>
        </Link>
        <Link to="/select-language" className="action-button lesson-btn">
          <span className="action-icon">🌍</span>
          <span className="action-text">Change Language</span>
        </Link>
        <Link to="/community" className="action-button community-btn">
          <span className="action-icon">👥</span>
          <span className="action-text">Language Partners</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
