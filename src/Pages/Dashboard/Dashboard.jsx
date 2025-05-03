import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Dashboard.scss";

const Dashboard = () => {
  // Get location to detect navigation changes
  const location = useLocation();
  
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
    overall: true,
    achievements: false,
    activities: false,
    leaderboard: false,
    streakData: false
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
  const [weeklyXP, setWeeklyXP] = useState([]);
  const [showFriendsLeaderboard, setShowFriendsLeaderboard] = useState(false);

  // References for scroll buttons
  const activitiesContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Configure axios defaults
  const API_BASE_URL = "http://localhost:8000/api";

  // Set up axios instance with auth token
  const setupAxios = (token) => {
    if (token) {
      console.log("Setting up axios with token:", token.substring(0, 15) + "..."); // Show just the beginning of the token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("No token provided for axios setup");
    }
  };

  // Load user data and selected language from localStorage on component mount
  // and when the location changes (navigation back to dashboard)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Initializing Dashboard component...");
        
        // Check localStorage for user data
        const userFromStorage = localStorage.getItem("xlingoUser");
        console.log("User data in localStorage:", userFromStorage ? "Found" : "Not found");
        
        if (!userFromStorage) {
          console.log("No user found in localStorage - not authenticated");
          setLoading({
            achievements: false,
            activities: false,
            leaderboard: false,
            streakData: false,
            overall: false,
          });
          return;
        }

        // Parse user data
        let user;
        try {
          user = JSON.parse(userFromStorage);
          console.log("User data parsed successfully:", { 
            id: user._id ? user._id.substring(0, 8) + "..." : "missing", 
            username: user.username || "missing",
            hasToken: !!user.token 
          });
        } catch (parseError) {
          console.error("Failed to parse user data from localStorage:", parseError);
          setError("Invalid user data format. Please try signing in again.");
          return;
        }

        // Update user data in state
        if (user.currentLanguage) {
          console.log("Setting language from storage:", user.currentLanguage.name);
          setCurrentLanguage((prevLang) => ({
            ...prevLang,
            ...user.currentLanguage,
          }));
        } else {
          console.log("No language data found in storage");
        }

        if (user._id) {
          console.log("Setting user ID:", user._id.substring(0, 8) + "...");
          setUserId(user._id);
        } else {
          console.error("No user ID found in storage");
        }

        if (user.token) {
          console.log("Setting token from storage", user.token.substring(0, 15) + "...");
          setToken(user.token);
          setupAxios(user.token);
        } else {
          console.error("No token found in storage");
        }

        if (user.username) {
          console.log("Setting username:", user.username);
          setUsername(user.username);
        }

        // Fetch data if we have the user ID
        if (user._id) {
          console.log("Starting to fetch dashboard data for user ID:", user._id.substring(0, 8) + "...");
          await fetchDashboardData(user._id, user.token || "");
          
          // Automatically fetch global leaderboard data initially
          await fetchLeaderboard(user._id, user.token || "", false);
          
          // Set default leaderboard to show the global leaderboard without requiring a click
          setShowFriendsLeaderboard(false);
        } else {
          console.error("Cannot fetch dashboard data - missing user ID");
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
  }, [location.pathname]); // Add location.pathname as dependency to refresh when navigating back

  // Refresh interval state
  const [refreshInterval] = useState(30000); // 30 seconds refresh interval

  // Auto-refresh dashboard data
  useEffect(() => {
    if (!userId || !token) return;

    // Initial fetch
    fetchDashboardData(userId, token);

    // Set up interval for periodic refresh
    const intervalId = setInterval(() => {
      fetchDashboardData(userId, token);
    }, refreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [userId, token, refreshInterval]); // Dependencies array

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
    console.log('[fetchDashboardData] Starting fetch...');

    try {
      // Fetch user progress data directly from the progress endpoint
      try {
        console.log(`[fetchDashboardData] Fetching user progress from: ${API_BASE_URL}/stats/progress`);
        const progressRes = await axios.get(
          `${API_BASE_URL}/stats/progress`,
          { 
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // --- Enhanced Logging --- 
        console.log("[fetchDashboardData] Progress API Raw Response Status:", progressRes.status);
        console.log("[fetchDashboardData] Progress API Raw Response Data:", JSON.stringify(progressRes.data, null, 2));
        // --- End Enhanced Logging ---
        
        const progressData = progressRes.data || {};
        
        // Store the full progress data
        console.log("[fetchDashboardData] Setting userProgress state with:", progressData);
        setUserProgress(progressData); // Set userProgress state first

        // Update language state based on progress data
        console.log("[fetchDashboardData] Updating currentLanguage state...");
        setCurrentLanguage((prev) => {
          const updated = {
            ...prev,
            streak: progressData.streak ?? prev.streak ?? 0,
            level: progressData.level ?? prev.level ?? 1,
            xp: progressData.totalXp ?? prev.xp ?? 0,
            nextLevelXp: calculateNextLevelXp(progressData.level ?? prev.level ?? 1),
            // Use defaults directly here if needed, but userProgress state is preferred source
            dailyGoal: progressData.dailyGoals?.xpTarget ?? 30, 
            dailyProgress: progressData.dailyProgress?.xpEarned ?? 0,
          };
          console.log("[fetchDashboardData] Updated currentLanguage state:", updated);
          return updated;
        });
        
        // Update streak data separately if needed for specific components
        setStreakData(progressData.streak ?? 0);
        
        // Store weekly XP data if available
        if (progressData.weeklyXP && progressData.weeklyXP.length > 0) {
          console.log("[fetchDashboardData] Setting weekly XP data:", progressData.weeklyXP);
          setWeeklyXP(progressData.weeklyXP);
        }
        
      } catch (error) {
        console.error(
          "[fetchDashboardData] Error fetching user progress:",
          error.response?.data || error.message
        );
        console.error("[fetchDashboardData] Full error object:", error);
        // Set userProgress to null or an empty object on error?
        setUserProgress(null); 
      } finally {
        setLoading((prev) => ({ ...prev, streakData: false }));
      }

      // Fetch user's weekly progress for chart
      try {
        console.log(`Fetching weekly progress from: ${API_BASE_URL}/stats/weekly/${userId}`);
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        const weeklyRes = await axios.get(
          `${API_BASE_URL}/stats/weekly/${userId}`,
          { headers }
        );
        
        if (weeklyRes.data && weeklyRes.data.length > 0) {
          setWeeklyXP(weeklyRes.data);
        }
      } catch (error) {
        console.error(
          "Error fetching weekly progress:",
          error.response?.data || error.message
        );
        // Use empty weekly data if fetch fails
      }

      // Fetch achievements data
      try {
        console.log(
          `Fetching achievements from: ${API_BASE_URL}/achievements/user/${userId}`
        );
        const headers = {
          Authorization: `Bearer ${token}`
        };
        const achievementsRes = await axios.get(
          `${API_BASE_URL}/achievements/user/${userId}`,
          { headers }
        );
        console.log(
          "Achievements API response status:",
          achievementsRes.status
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
        setChallengesData(challengesFromAchievements);
      } catch (error) {
        console.error(
          "Error fetching achievements:",
          error.response?.data || error.message
        );
        setError("Failed to load achievements. Please try again.");
        setAchievements([]);
        setChallengesData([]);
      } finally {
        setLoading((prev) => ({ ...prev, achievements: false }));
      }

      // Fetch all user activities for learning sections
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };
        const activitiesRes = await axios.get(
          `${API_BASE_URL}/activities/user/${userId}`,
          { headers }
        );
        const activitiesData = activitiesRes.data || [];
        setActivities(activitiesData);

        // Process activities for display in learning section
        const processedActivities = processActivitiesData(activitiesData);
        setRecentActivities(processedActivities);
      } catch (error) {
        console.error(
          "Error fetching activities:",
          error.response?.data || error.message
        );
        setError("Failed to load learning activities.");
        setActivities([]);
        setRecentActivities([]);
      } finally {
        setLoading((prev) => ({ ...prev, activities: false }));
      }

      // Fetch global leaderboard data 
      await fetchLeaderboard(userId, token, false);

      // Update overall loading state
      setLoading((prev) => ({ ...prev, overall: false }));
    } catch (err) {
      console.error("Error in fetchDashboardData:", err);
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

  // Helper function to calculate XP needed for next level
  const calculateNextLevelXp = (currentLevel) => {
    // XP increases with each level
    const baseXp = 100;
    const xpMultiplier = 1.5;
    return Math.round(baseXp * Math.pow(xpMultiplier, currentLevel - 1));
  };
  
  // Separate function to fetch leaderboard data
  const fetchLeaderboard = async (userId, token, friendsOnly = false) => {
    try {
      setLoading((prev) => ({ ...prev, leaderboard: true }));
      
      let url;
      if (friendsOnly) {
        // Use the community API endpoint to get friends data for the leaderboard
        url = `${API_BASE_URL}/community/friends`;
      } else {
        // Use the regular leaderboard endpoint for global rankings
        url = `${API_BASE_URL}/stats/leaderboard?userId=${userId}&limit=10&friendsOnly=false`;
      }
      
      console.log(`Fetching leaderboard from: ${url}`);
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const leaderboardRes = await axios.get(url, { headers });
      
      console.log("Leaderboard API response status:", leaderboardRes.status);
      
      let leaderboardData;
      
      if (friendsOnly) {
        // Process friends data into leaderboard format
        if (leaderboardRes.data && leaderboardRes.data.friends) {
          // Map the friends data to the same format as the leaderboard data
          leaderboardData = leaderboardRes.data.friends.map(friend => ({
            _id: friend.id,
            username: friend.username,
            firstName: friend.firstName,
            lastName: friend.lastName,
            profileImage: friend.profileImage,
            totalXp: friend.totalXp || 0,
            streak: friend.streak || 0,
            isCurrentUser: false
          }));
          
          // Add the current user to the friends leaderboard
          const currentUser = leaderboardData.find(user => user._id === userId);
          if (!currentUser) {
            // Add current user to the friends leaderboard if not already included
            const user = JSON.parse(localStorage.getItem("xlingoUser"));
            if (user) {
              leaderboardData.push({
                _id: userId,
                username: user.username || "You",
                profileImage: user.profileImage || "👤",
                totalXp: currentLanguage.xp || 0,
                streak: currentLanguage.streak || 0,
                isCurrentUser: true
              });
            }
          }
          
          // Sort the friends leaderboard by XP
          leaderboardData.sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0));
        } else {
          leaderboardData = [];
        }
      } else {
        // For global leaderboard, use the data as returned by the API
        leaderboardData = leaderboardRes.data?.rankings || [];
      }
      
      console.log("Leaderboard data processed:", leaderboardData.length, "users");
      
      setLeaderboardData(leaderboardData);
      setShowFriendsLeaderboard(friendsOnly);
    } catch (error) {
      console.error(
        "Error fetching leaderboard:",
        error.response?.data || error.message
      );
      
      // Fall back to processed leaderboard data if the API fails
      const fallbackLeaderboard = getDefaultLeaderboard(userId);
      setLeaderboardData(fallbackLeaderboard);
    } finally {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
    }
  };

  // Toggle between global and friends leaderboard
  const toggleLeaderboardType = () => {
    fetchLeaderboard(userId, token, !showFriendsLeaderboard);
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
        // Calculate progress percentage for achievements in progress
        let progressPercentage = 0;
        
        if (achievement.isCompleted) {
          progressPercentage = 100;
        } else if (achievement.currentValue && achievement.requirements && achievement.requirements.value) {
          progressPercentage = Math.min(
            Math.floor((achievement.currentValue / achievement.requirements.value) * 100),
            99 // Cap at 99% if not complete
          );
        }
        
        return {
          id: achievement._id,
          title: achievement.name,
          description:
            achievement.description || "Complete this challenge to earn XP!",
          xp: achievement.xpReward || 10,
          completed: achievement.isCompleted || false,
          icon: achievement.icon || getDifficultyIcon(achievement.rarity),
          progressPercentage,
          currentValue: achievement.currentValue || 0,
          targetValue: achievement.requirements?.value || 0,
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

  // Calculate daily goal percentage with explicit handling based on targets
  const calculateDailyGoalPercentage = () => {
    if (!userProgress || !userProgress.dailyGoals || !userProgress.dailyProgress) {
      // If no user progress data, use the simplified calculation
      return Math.min((currentLanguage.dailyProgress / dailyGoal) * 100, 100);
    }
    
    // Get the target values from dailyGoals
    const { xpTarget = 30, lessonsTarget = 2, vocabularyTarget = 10 } = userProgress.dailyGoals;
    
    // Get the current progress values
    const xpProgress = userProgress.dailyProgress.xpEarned || 0;
    const lessonsProgress = userProgress.dailyProgress.lessonsCompleted || 0;
    const vocabProgress = userProgress.dailyProgress.vocabularyLearned || 0;
    
    // Calculate percentage for each component
    const xpPercentage = Math.min((xpProgress / xpTarget) * 100, 100);
    const lessonsPercentage = Math.min((lessonsProgress / lessonsTarget) * 100, 100);
    const vocabPercentage = Math.min((vocabProgress / vocabularyTarget) * 100, 100);
    
    // Calculate combined percentage (weighted average)
    // XP is weighted more heavily (50%), lessons and vocabulary are 25% each
    const combinedPercentage = (xpPercentage * 0.5) + (lessonsPercentage * 0.25) + (vocabPercentage * 0.25);
    
    return Math.min(combinedPercentage, 100);
  };

  // Calculate combined daily goal progress percentage based on all 3 parameters
  const calculateDailyGoalProgress = () => {
    // Default target values if userProgress is not available
    const xpTarget = userProgress?.dailyGoals?.xpTarget || 30;
    const lessonsTarget = userProgress?.dailyGoals?.lessonsTarget || 2;
    const vocabularyTarget = userProgress?.dailyGoals?.vocabularyTarget || 10;
    
    // Current progress values
    const xpEarned = userProgress?.dailyProgress?.xpEarned || currentLanguage.dailyProgress || 0;
    const lessonsCompleted = userProgress?.dailyProgress?.lessonsCompleted || 0;
    const vocabularyLearned = userProgress?.dailyProgress?.vocabularyLearned || 0;
    
    // Calculate individual percentages (cap at 100%)
    const xpPercentage = Math.min((xpEarned / xpTarget) * 100, 100);
    const lessonsPercentage = Math.min((lessonsCompleted / lessonsTarget) * 100, 100);
    const vocabPercentage = Math.min((vocabularyLearned / vocabularyTarget) * 100, 100);
    
    // Get the weighted average progress (can adjust weights as needed)
    const weights = {
      xp: 0.5,           // XP is 50% of progress
      lessons: 0.3,       // Lessons are 30% of progress
      vocabulary: 0.2     // Vocabulary is 20% of progress
    };
    
    const weightedProgress = (
      xpPercentage * weights.xp + 
      lessonsPercentage * weights.lessons + 
      vocabPercentage * weights.vocabulary
    );
    
    // Return object with all progress details for use in UI
    return {
      overall: Math.min(Math.round(weightedProgress), 100),
      xp: {
        current: xpEarned,
        target: xpTarget,
        percentage: xpPercentage,
        isComplete: xpEarned >= xpTarget
      },
      lessons: {
        current: lessonsCompleted,
        target: lessonsTarget,
        percentage: lessonsPercentage,
        isComplete: lessonsCompleted >= lessonsTarget
      },
      vocabulary: {
        current: vocabularyLearned,
        target: vocabularyTarget,
        percentage: vocabPercentage,
        isComplete: vocabularyLearned >= vocabularyTarget
      }
    };
  };

  // Simple function to calculate progress percentage for daily goals
  const calculateDailyProgressPercentage = () => {
    // No need for extensive logging here anymore if we ensure userProgress exists before calling
    if (!userProgress) {
      console.warn("[calculateDailyProgressPercentage] Called with null userProgress. Returning 0.");
      return 0; // Return 0 if state is null/undefined
    }

    // Get target values (fallback to defaults if not available)
    const xpTarget = userProgress.dailyGoals?.xpTarget || 30;
    const lessonsTarget = userProgress.dailyGoals?.lessonsTarget || 2;
    const vocabularyTarget = userProgress.dailyGoals?.vocabularyTarget || 10;

    // Get current progress values
    const xpEarned = userProgress.dailyProgress?.xpEarned || 0; 
    const lessonsCompleted = userProgress.dailyProgress?.lessonsCompleted || 0;
    const vocabularyLearned = userProgress.dailyProgress?.vocabularyLearned || 0;

    // Ensure targets are not zero
    const safeXpTarget = xpTarget || 1; 
    const safeLessonsTarget = lessonsTarget || 1;
    const safeVocabularyTarget = vocabularyTarget || 1;

    const xpPercentage = Math.min((xpEarned / safeXpTarget) * 100, 100);
    const lessonsPercentage = Math.min((lessonsCompleted / safeLessonsTarget) * 100, 100);
    const vocabPercentage = Math.min((vocabularyLearned / safeVocabularyTarget) * 100, 100);

    // Calculate weighted average
    const weightedPercentage = (
      (xpPercentage * 0.6) +      
      (lessonsPercentage * 0.2) + 
      (vocabPercentage * 0.2)     
    );

    // Check for NaN before rounding
    const finalPercentage = isNaN(weightedPercentage) ? 0 : Math.min(Math.round(weightedPercentage), 100);
    
    // console.log("[calculateDailyProgressPercentage] Final Calculated Percentage:", finalPercentage); // Keep this one if needed

    return finalPercentage;
  };

  // Calculate daily goal percentage (prevent division by zero)
  const dailyGoal = currentLanguage.dailyGoal || 30;
  const dailyProgressPercentage = calculateDailyGoalPercentage();

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

  // Only show loading indicator when overall loading is true
  if (loading.overall) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your language dashboard...</p>
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
                <h4>{streakData} day streak</h4>
                <p>
                  {streakData > 0
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
                <span>{currentLanguage.nextLevelXp} XP</span>
              </div>
              <p>Keep earning XP to reach level {currentLanguage.level + 1}</p>
            </div>

            <div className="progress-card daily-goal">
              <h4>Daily Goal</h4>
              {(() => { 
                // Log the state right before calculation in render
                console.log("[Render] userProgress state before calculation:", userProgress);
                
                const percentage = calculateDailyProgressPercentage();
                
                // Log the result immediately after calculation in render
                console.log("[Render] Calculated Percentage:", percentage);

                let progressBarClass = 'progress-bar';
                // ... (rest of the class logic remains the same)
                if (percentage >= 100) {
                  progressBarClass += ' completed';
                } else if (percentage >= 70) {
                  progressBarClass += ' almost-complete';
                } else if (percentage >= 30) {
                  progressBarClass += ' in-progress';
                } else if (percentage > 0) { 
                  progressBarClass += ' just-started';
                }

                return (
                  <>
                    {/* Temporarily display the raw percentage for debugging */}
                    <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>
                      DEBUG: Raw Percentage = {percentage}%
                    </div>
                    {/* ... rest of the JSX ... */}
                    <div className="progress-bar-container">
                      <div
                        className={progressBarClass} 
                        style={{ width: `${percentage}%` }} 
                      >
                        {/* ... existing span ... */}
                      </div>
                    </div>
                    {/* ... rest of the details and paragraph ... */}
                  </>
                );
              })()}
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
                    {!challenge.completed && (
                      <div className="challenge-progress">
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{ width: `${challenge.progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="progress-details">
                          <span>{challenge.currentValue}</span>
                          <span>{challenge.targetValue}</span>
                        </div>
                      </div>
                    )}
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
            <div className="leaderboard-controls">
              <button 
                className={`leaderboard-toggle ${!showFriendsLeaderboard ? 'active' : ''}`}
                onClick={() => toggleLeaderboardType()}
              >
                Global
              </button>
              <button 
                className={`leaderboard-toggle ${showFriendsLeaderboard ? 'active' : ''}`}
                onClick={() => toggleLeaderboardType()}
              >
                Friends
              </button>
              <Link to="/community" className="see-all-link">
                View All
              </Link>
            </div>
          </div>

          <div className="leaderboard-list">
            {loading.leaderboard ? (
              <div className="loading-indicator">Loading leaderboard...</div>
            ) : leaderboardData && leaderboardData.length > 0 ? (
              leaderboardData.map((user, index) => (
                <div
                  key={user._id || `user-${index}`}
                  className={`leaderboard-item ${
                    user.isCurrentUser ? "current-user" : ""
                  }`}
                >
                  <div className="rank">{index + 1}</div>
                  <div className="user-avatar letter-avatar">
                    {(user.isCurrentUser ? "Y" : user.username?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="user-name">
                    {user.isCurrentUser ? "You" : user.username}
                  </div>
                  <div className="user-stats">
                    <div className="user-xp">{user.totalXp} XP</div>
                    {user.streak > 0 && (
                      <div className="user-streak">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-count">{user.streak}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : showFriendsLeaderboard ? (
              <div className="no-leaderboard">
                <p>Add friends to see them on your leaderboard!</p>
                <Link to="/community" className="find-friends-btn">
                  Find Friends
                </Link>
              </div>
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
