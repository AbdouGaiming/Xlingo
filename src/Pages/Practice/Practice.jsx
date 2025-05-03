import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import VocabularyFlashcards from "../../components/language/VocabularyFlashcards";
import "./Practice.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Practice = () => {
  // Fixed language to Spanish only
  const selectedLanguage = "es";
  const [selectedCategory, setSelectedCategory] = useState("vocabulary");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("vocabulary"); // vocabulary, pronunciation, etc.
  const [loading, setLoading] = useState(true);
  const [practiceContent, setPracticeContent] = useState(null);

  // Get token for authenticated requests
  const getAuthHeader = () => {
    const token = localStorage.getItem("xlingoToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch available categories for Spanish
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(`${API_URL}/vocabulary/categories`, {
          params: { languageId: selectedLanguage },
          headers: getAuthHeader(),
        });

        if (response.data && response.data.length > 0) {
          setCategories(response.data);
          // If current category is not available, reset it
          if (!response.data.includes(selectedCategory)) {
            setSelectedCategory(response.data[0]);
          }
        } else {
          setCategories([]);
          setSelectedCategory("");
        }
      } catch (err) {
        console.error("Error fetching vocabulary categories:", err);
        // Fallback categories
        setCategories(["basics", "food", "travel"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []); // No dependency on selectedLanguage as it's now fixed

  // Format category names for display
  const formatCategoryName = (category) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get user statistics
  const [userStats, setUserStats] = useState({
    wordsLearned: 0,
    wordsToReview: 0,
    masteryPercentage: 0,
  });

  // Fetch user vocabulary statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("xlingoToken");

        // Only fetch stats if user is logged in
        if (!token) {
          return;
        }

        const response = await axios.get(`${API_URL}/vocabulary/progress`, {
          params: { languageId: selectedLanguage },
          headers: getAuthHeader(),
        });

        if (response.data) {
          const words = response.data;
          const learned = words.filter(
            (w) => w.status === "known" || w.status === "mastered"
          ).length;
          const review = words.filter((w) => w.status === "learning").length;
          const total = words.length > 0 ? words.length : 1; // Avoid division by zero

          setUserStats({
            wordsLearned: learned,
            wordsToReview: review,
            masteryPercentage: Math.round((learned / total) * 100),
          });
        }
      } catch (err) {
        console.error("Error fetching user vocabulary stats:", err);
        // Non-critical error, don't disrupt user experience
      }
    };

    fetchUserStats();
  }, []);

  // Function to load content based on category
  const loadContentForCategory = async (category) => {
    try {
      const token = localStorage.getItem("xlingoToken");
      const response = await axios.get(`${API_URL}/vocabulary/practice/${category}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          languageId: selectedLanguage
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error loading ${category} content:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadPracticeContent = async () => {
      setLoading(true);
      try {
        // Load practice content based on selectedCategory
        const content = await loadContentForCategory(selectedCategory);
        setPracticeContent(content);
      } catch (err) {
        console.error('Error loading practice content:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPracticeContent();
  }, [selectedCategory]);

  return (
    <div className="practice-page-container">
      <h1>Practice Zone</h1>
      <p>Practice Spanish to enhance your skills!</p>

      <div className="practice-controls">
        {isLoading && <div className="loading-spinner small"></div>}
      </div>

      <div className="practice-grid">
        <div
          className={`practice-section ${
            activeSection === "vocabulary" ? "active" : ""
          }`}
          onClick={() => setActiveSection("vocabulary")}
        >
          <h2>Vocabulary Flashcards</h2>

          <div className="practice-description">
            Learn and review Spanish vocabulary words with interactive
            flashcards. Test your memory and track your progress.
          </div>

          {localStorage.getItem("xlingoToken") && (
            <div className="practice-stats">
              <div className="stat-item">
                <div className="stat-value">{userStats.wordsLearned}</div>
                <div className="stat-label">Words Learned</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{userStats.wordsToReview}</div>
                <div className="stat-label">For Review</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{userStats.masteryPercentage}%</div>
                <div className="stat-label">Mastery</div>
              </div>
            </div>
          )}

          {activeSection === "vocabulary" && (
            <div className="category-selector">
              <label>Select a category:</label>
              <div className="category-buttons">
                <button
                  className={selectedCategory === "" ? "active" : ""}
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={selectedCategory === category ? "active" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {formatCategoryName(category)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`practice-section ${
            activeSection === "pronunciation" ? "active" : ""
          }`}
          onClick={() => setActiveSection("pronunciation")}
        >
          <h2>Pronunciation Practice</h2>

          <div className="practice-description">
            Improve your Spanish pronunciation by speaking words and phrases.
            Get feedback on your accent and clarity.
          </div>

          <div className="practice-actions">
            <Link to="/practice/pronunciation" className="practice-button">
              <span className="button-icon">🎤</span>
              Start Practice
            </Link>
          </div>
        </div>

        <div
          className={`practice-section ${
            activeSection === "listening" ? "active" : ""
          }`}
          onClick={() => setActiveSection("listening")}
        >
          <h2>Listening Exercises</h2>

          <div className="practice-description">
            Train your ear to understand spoken Spanish with various listening
            exercises and audio clips.
          </div>

          <div className="practice-actions">
            <button className="practice-button" disabled>
              <span className="button-icon">🎧</span>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {activeSection === "vocabulary" && (
        <div className="current-practice">
          <VocabularyFlashcards
            languageId={selectedLanguage}
            categoryId={selectedCategory}
          />
        </div>
      )}
    </div>
  );
};

export default Practice;
