import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VocabularyFlashcards.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Mock data as fallback when API fails
const MOCK_VOCABULARY = {
  es: {
    food: [
      {
        _id: "mock1",
        word: "el pan",
        translation: "bread",
        example: "Me gusta el pan fresco.",
        hint: "Something you eat with butter",
        difficulty: 1,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock2",
        word: "la manzana",
        translation: "apple",
        example: "Como una manzana cada día.",
        hint: "A fruit that keeps the doctor away",
        difficulty: 1,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock3",
        word: "la leche",
        translation: "milk",
        example: "Bebo leche con el desayuno.",
        hint: "White liquid from cows",
        difficulty: 1,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock4",
        word: "el queso",
        translation: "cheese",
        example: "El queso va bien con el vino.",
        hint: "Dairy product, often yellow",
        difficulty: 2,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock5",
        word: "el agua",
        translation: "water",
        example: "Bebo mucha agua cada día.",
        hint: "Essential liquid for life",
        difficulty: 1,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock9",
        word: "la sopa",
        translation: "soup",
        example: "La sopa está caliente.",
        hint: "Liquid food typically served hot",
        difficulty: 1,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock10",
        word: "el pescado",
        translation: "fish",
        example: "Me gusta comer pescado fresco.",
        hint: "Seafood that swims",
        difficulty: 2,
        languageId: "es",
        categoryId: "food",
      },
      {
        _id: "mock11",
        word: "la fruta",
        translation: "fruit",
        example: "Como fruta todos los días.",
        hint: "Healthy sweet food from plants",
        difficulty: 1,
        languageId: "es",
        categoryId: "food",
      },
    ],
    basics: [
      {
        _id: "mock6",
        word: "hola",
        translation: "hello",
        example: "Hola, ¿cómo estás?",
        hint: "A greeting",
        difficulty: 1,
        languageId: "es",
        categoryId: "basics",
      },
      {
        _id: "mock7",
        word: "adiós",
        translation: "goodbye",
        example: "Adiós, nos vemos mañana.",
        hint: "What you say when leaving",
        difficulty: 1,
        languageId: "es",
        categoryId: "basics",
      },
      {
        _id: "mock8",
        word: "gracias",
        translation: "thank you",
        example: "Muchas gracias por tu ayuda.",
        hint: "Express gratitude",
        difficulty: 1,
        languageId: "es",
        categoryId: "basics",
      },
      {
        _id: "mock12",
        word: "buenos días",
        translation: "good morning",
        example: "Buenos días, ¿cómo estás?",
        hint: "Morning greeting",
        difficulty: 1,
        languageId: "es",
        categoryId: "basics",
      },
      {
        _id: "mock13",
        word: "buenas noches",
        translation: "good night",
        example: "Buenas noches, hasta mañana.",
        hint: "What you say before sleeping",
        difficulty: 1,
        languageId: "es",
        categoryId: "basics",
      },
    ],
    travel: [
      {
        _id: "mock14",
        word: "el tren",
        translation: "train",
        example: "El tren sale a las ocho.",
        hint: "Transportation on rails",
        difficulty: 1,
        languageId: "es",
        categoryId: "travel",
      },
      {
        _id: "mock15",
        word: "el avión",
        translation: "airplane",
        example: "Voy a tomar un avión a Madrid.",
        hint: "Flying transportation",
        difficulty: 1,
        languageId: "es",
        categoryId: "travel",
      },
      {
        _id: "mock16",
        word: "el hotel",
        translation: "hotel",
        example: "Nos quedamos en un hotel.",
        hint: "Place to stay when traveling",
        difficulty: 1,
        languageId: "es",
        categoryId: "travel",
      },
      {
        _id: "mock17",
        word: "el pasaporte",
        translation: "passport",
        example: "Necesito mi pasaporte para viajar.",
        hint: "Document for international travel",
        difficulty: 2,
        languageId: "es",
        categoryId: "travel",
      },
      {
        _id: "mock18",
        word: "la maleta",
        translation: "suitcase",
        example: "Preparo mi maleta para el viaje.",
        hint: "Container for clothes when traveling",
        difficulty: 1,
        languageId: "es",
        categoryId: "travel",
      },
    ],
  },
  fr: {
    basics: [
      {
        _id: "mock19",
        word: "bonjour",
        translation: "hello",
        example: "Bonjour, comment ça va?",
        hint: "Basic greeting",
        difficulty: 1,
        languageId: "fr",
        categoryId: "basics",
      },
      {
        _id: "mock20",
        word: "merci",
        translation: "thank you",
        example: "Merci beaucoup pour votre aide.",
        hint: "Expression of gratitude",
        difficulty: 1,
        languageId: "fr",
        categoryId: "basics",
      },
      {
        _id: "mock21",
        word: "au revoir",
        translation: "goodbye",
        example: "Au revoir, à bientôt!",
        hint: "Parting phrase",
        difficulty: 1,
        languageId: "fr",
        categoryId: "basics",
      },
    ],
    food: [
      {
        _id: "mock22",
        word: "le pain",
        translation: "bread",
        example: "J'aime le pain frais.",
        hint: "Baked staple food",
        difficulty: 1,
        languageId: "fr",
        categoryId: "food",
      },
      {
        _id: "mock23",
        word: "le fromage",
        translation: "cheese",
        example: "La France est connue pour son fromage.",
        hint: "Dairy product, often aged",
        difficulty: 1,
        languageId: "fr",
        categoryId: "food",
      },
    ],
  },
};

const VocabularyFlashcards = ({ languageId = "es", categoryId }) => {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState([]);
  const [reviewLaterWords, setReviewLaterWords] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    knownCount: 0,
    reviewCount: 0,
    timeSpent: 0,
  });
  const [timer, setTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token for authenticated requests
  const getAuthHeader = () => {
    const token = localStorage.getItem("xlingoToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch vocabulary cards from API with fallback to mock data
  const fetchCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Define query parameters
      const params = { languageId, limit: 10 };
      if (categoryId) params.categoryId = categoryId;

      // Try to fetch data from API first
      console.log("Fetching vocabulary data from API...");
      const response = await axios.get(`${API_URL}/vocabulary/random`, {
        params,
        headers: getAuthHeader(),
      });

      // Check if API returned valid data
      if (response.data && response.data.length > 0) {
        console.log("Successfully fetched vocabulary data from API");
        setCards(response.data);
        setSessionStats({
          ...sessionStats,
          totalCards: response.data.length,
          knownCount: 0,
          reviewCount: 0,
        });
        return;
      } else {
        console.log("API returned empty data, falling back to mock data");
        // If API returned empty data, fall back to mock data
        throw new Error("No vocabulary data returned from API");
      }
    } catch (err) {
      console.error("Error fetching vocabulary from API:", err);
      console.log("Falling back to mock vocabulary data");

      // Fall back to mock data
      let mockCards = [];
      if (categoryId && MOCK_VOCABULARY[languageId]?.[categoryId]) {
        mockCards = MOCK_VOCABULARY[languageId][categoryId];
      } else {
        // If no specific category, combine all categories
        mockCards = Object.values(MOCK_VOCABULARY[languageId] || {}).flat();
      }

      if (mockCards.length > 0) {
        setCards(mockCards);
        setSessionStats({
          ...sessionStats,
          totalCards: mockCards.length,
          knownCount: 0,
          reviewCount: 0,
        });
      } else {
        setError("No vocabulary cards found for this category.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update user's progress for a word
  const updateWordProgress = async (vocabularyId, status) => {
    try {
      // Only make API call if user is authenticated and vocabularyId doesn't start with "mock"
      if (
        !localStorage.getItem("xlingoToken") ||
        vocabularyId.startsWith("mock")
      )
        return;

      await axios.post(
        `${API_URL}/vocabulary/progress`,
        {
          vocabularyId,
          status,
        },
        {
          headers: getAuthHeader(),
        }
      );

      // No need to handle response as we don't use it directly in the UI
    } catch (err) {
      console.error("Error updating word progress:", err);
      // Continue without breaking the user experience
    }
  };

  // Initialize or update cards when language or category changes
  useEffect(() => {
    fetchCards();
    setCurrentCardIndex(0);
    setKnownWords([]);
    setReviewLaterWords([]);
    setSessionComplete(false);
    setTimer(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [languageId, categoryId]);

  // Timer effect for session duration tracking
  useEffect(() => {
    let interval = null;
    if (!sessionComplete && !isLoading && cards.length > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionComplete, isLoading, cards.length]);

  // Format timer to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle card flip
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false); // Hide hint when flipping
  };

  // User knows the word - move to next and track
  const handleKnowCard = () => {
    if (currentCardIndex < cards.length) {
      const currentCard = cards[currentCardIndex];

      // Add to known words list
      setKnownWords([...knownWords, currentCard._id]);

      // Update session stats
      setSessionStats({
        ...sessionStats,
        knownCount: sessionStats.knownCount + 1,
      });

      // Save progress to database
      updateWordProgress(currentCard._id, "known");

      // Move to the next card
      moveToNextCard();
    }
  };

  // User wants to review the word later - move to next and track
  const handleReviewLater = () => {
    if (currentCardIndex < cards.length) {
      const currentCard = cards[currentCardIndex];

      // Add to review later list
      setReviewLaterWords([...reviewLaterWords, currentCard._id]);

      // Update session stats
      setSessionStats({
        ...sessionStats,
        reviewCount: sessionStats.reviewCount + 1,
      });

      // Save progress to database
      updateWordProgress(currentCard._id, "learning");

      // Move to the next card
      moveToNextCard();
    }
  };

  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // Move to the next card
  const moveToNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // End of session
      setSessionComplete(true);
      setSessionStats({
        ...sessionStats,
        timeSpent: timer,
      });

      // Record activity completion
      recordActivityCompletion();
    }
  };

  // Record the activity completion for achievements/tracking
  const recordActivityCompletion = async () => {
    try {
      if (!localStorage.getItem("xlingoToken")) return;

      await axios.post(
        `${API_URL}/activities/complete`,
        {
          activityType: "vocabulary_practice",
          languageId,
          details: {
            totalCards: sessionStats.totalCards,
            knownCount: sessionStats.knownCount,
            reviewCount: sessionStats.reviewCount,
            accuracy: calculateAccuracy(),
            timeSpent: timer,
            categoryId: categoryId || "mixed",
          },
        },
        {
          headers: getAuthHeader(),
        }
      );
    } catch (err) {
      console.error("Error recording activity completion:", err);
      // Non-critical, continue without breaking user experience
    }
  };

  // Start a new session with the words marked for review
  const reviewMissedWords = () => {
    // Filter cards to only include those marked for review
    const reviewCards = cards.filter((card) =>
      reviewLaterWords.includes(card._id)
    );

    setCards(reviewCards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setReviewLaterWords([]);
    setSessionComplete(false);
    setSessionStats({
      totalCards: reviewCards.length,
      knownCount: 0,
      reviewCount: 0,
      timeSpent: 0,
    });
    setTimer(0);
  };

  // Restart with all words
  const restartSession = () => {
    // Fetch a new set of random vocabulary
    fetchCards();
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setReviewLaterWords([]);
    setSessionComplete(false);
    setSessionStats((prevStats) => ({
      ...prevStats,
      knownCount: 0,
      reviewCount: 0,
      timeSpent: 0,
    }));
    setTimer(0);
  };

  // Calculate session accuracy
  const calculateAccuracy = () => {
    if (sessionStats.totalCards === 0) return 0;
    return Math.round(
      (sessionStats.knownCount / sessionStats.totalCards) * 100
    );
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="vocabulary-flashcards-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading vocabulary cards...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="vocabulary-flashcards-container">
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchCards}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary-flashcards-container">
      <div className="flashcards-header">
        <h2>Vocabulary Flashcards</h2>
        {!sessionComplete && cards.length > 0 && (
          <div className="session-progress">
            <div className="progress-text">
              <span>
                {currentCardIndex + 1} / {cards.length}
              </span>
              <span className="session-timer">{formatTime(timer)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(currentCardIndex / (cards.length - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {!sessionComplete && cards.length > 0 ? (
        <div className="flashcard-content">
          <div
            className={`flashcard ${isFlipped ? "flipped" : ""}`}
            onClick={flipCard}
          >
            <div className="flashcard-front">
              <div className="word">{cards[currentCardIndex].word}</div>
              {showHint && (
                <div className="hint-container">
                  <div className="hint-label">Hint:</div>
                  <div className="hint-text">
                    {cards[currentCardIndex].hint}
                  </div>
                </div>
              )}
            </div>
            <div className="flashcard-back">
              <div className="translation">
                {cards[currentCardIndex].translation}
              </div>
              <div className="example">{cards[currentCardIndex].example}</div>
            </div>
          </div>

          <div className="flashcard-actions">
            <button
              className="hint-button"
              onClick={toggleHint}
              disabled={isFlipped}
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            <div className="knowledge-actions">
              <button className="review-button" onClick={handleReviewLater}>
                <span className="button-icon">🔄</span>
                Review Later
              </button>
              <button className="know-button" onClick={handleKnowCard}>
                <span className="button-icon">✓</span>I Know This
              </button>
            </div>
          </div>
        </div>
      ) : sessionComplete ? (
        <div className="session-results">
          <h3>Session Complete!</h3>
          <div className="results-stats">
            <div className="result-item">
              <div className="result-label">Words Practiced</div>
              <div className="result-value">{sessionStats.totalCards}</div>
            </div>
            <div className="result-item">
              <div className="result-label">Words Known</div>
              <div className="result-value">{sessionStats.knownCount}</div>
            </div>
            <div className="result-item">
              <div className="result-label">For Review</div>
              <div className="result-value">{sessionStats.reviewCount}</div>
            </div>
            <div className="result-item">
              <div className="result-label">Accuracy</div>
              <div className="result-value">{calculateAccuracy()}%</div>
            </div>
            <div className="result-item">
              <div className="result-label">Time Spent</div>
              <div className="result-value">
                {formatTime(sessionStats.timeSpent)}
              </div>
            </div>
          </div>

          <div className="result-actions">
            {sessionStats.reviewCount > 0 && (
              <button
                className="review-missed-button"
                onClick={reviewMissedWords}
              >
                Practice Review Words ({sessionStats.reviewCount})
              </button>
            )}
            <button className="restart-button" onClick={restartSession}>
              Practice New Words
            </button>
          </div>
        </div>
      ) : (
        <div className="no-cards-message">
          <p>No vocabulary cards available for this category.</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyFlashcards;
