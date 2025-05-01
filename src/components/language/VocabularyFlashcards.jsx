import React, { useState, useEffect } from 'react';
import './VocabularyFlashcards.scss';

const VocabularyFlashcards = ({ languageId = 'es', categoryId }) => {
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
    timeSpent: 0
  });
  const [timer, setTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Mock vocabulary data for different languages and categories
  const vocabularyData = {
    es: {
      food: [
        { id: 1, word: 'el pan', translation: 'bread', example: 'Me gusta el pan fresco.', hint: 'Something you eat with butter' },
        { id: 2, word: 'la manzana', translation: 'apple', example: 'Como una manzana cada día.', hint: 'A fruit that keeps the doctor away' },
        { id: 3, word: 'la leche', translation: 'milk', example: 'Bebo leche con el desayuno.', hint: 'White liquid from cows' },
        { id: 4, word: 'el queso', translation: 'cheese', example: 'El queso va bien con el vino.', hint: 'Dairy product, often yellow' },
        { id: 5, word: 'el agua', translation: 'water', example: 'Bebo mucha agua cada día.', hint: 'Essential liquid for life' },
        { id: 6, word: 'la carne', translation: 'meat', example: 'No como mucha carne.', hint: 'Protein from animals' },
        { id: 7, word: 'los huevos', translation: 'eggs', example: 'Me gustan los huevos revueltos.', hint: 'Come from chickens' },
        { id: 8, word: 'el arroz', translation: 'rice', example: 'El arroz es un alimento básico.', hint: 'Small white grains' }
      ],
      travel: [
        { id: 1, word: 'el hotel', translation: 'hotel', example: 'Me quedo en un hotel.', hint: 'Where you stay when traveling' },
        { id: 2, word: 'el aeropuerto', translation: 'airport', example: 'Llegamos al aeropuerto a tiempo.', hint: 'Where planes take off and land' },
        { id: 3, word: 'el tren', translation: 'train', example: 'Viajo en tren a menudo.', hint: 'Moves on tracks' },
        { id: 4, word: 'el pasaporte', translation: 'passport', example: 'Necesito mi pasaporte para viajar.', hint: 'Document for international travel' },
        { id: 5, word: 'la playa', translation: 'beach', example: 'Vamos a la playa en verano.', hint: 'Sand and ocean' }
      ]
    },
    de: {
      food: [
        { id: 1, word: 'das Brot', translation: 'bread', example: 'Ich esse gern frisches Brot.', hint: 'Something you eat with butter' },
        { id: 2, word: 'der Apfel', translation: 'apple', example: 'Ich esse jeden Tag einen Apfel.', hint: 'A fruit that keeps the doctor away' },
        { id: 3, word: 'die Milch', translation: 'milk', example: 'Ich trinke Milch zum Frühstück.', hint: 'White liquid from cows' }
      ]
    }
  };

  // Initialize or update cards when language or category changes
  useEffect(() => {
    let selectedCategory = 'food'; // Default category
    if (categoryId && vocabularyData[languageId] && vocabularyData[languageId][categoryId]) {
      selectedCategory = categoryId;
    }

    if (vocabularyData[languageId] && vocabularyData[languageId][selectedCategory]) {
      const newCards = [...vocabularyData[languageId][selectedCategory]];
      setCards(newCards);
      setSessionStats({
        ...sessionStats,
        totalCards: newCards.length,
        knownCount: 0,
        reviewCount: 0,
        timeSpent: 0
      });
      setCurrentCardIndex(0);
      setKnownWords([]);
      setReviewLaterWords([]);
      setSessionComplete(false);
      setTimer(0);
    }
  }, [languageId, categoryId]);

  // Timer effect for session duration tracking
  useEffect(() => {
    let interval = null;
    if (!sessionComplete) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionComplete]);

  // Format timer to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle card flip
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false); // Hide hint when flipping
  };

  // User knows the word - move to next and track
  const handleKnowCard = () => {
    if (currentCardIndex < cards.length) {
      setKnownWords([...knownWords, cards[currentCardIndex].id]);
      setSessionStats({
        ...sessionStats,
        knownCount: sessionStats.knownCount + 1
      });
      moveToNextCard();
    }
  };

  // User wants to review the word later - move to next and track
  const handleReviewLater = () => {
    if (currentCardIndex < cards.length) {
      setReviewLaterWords([...reviewLaterWords, cards[currentCardIndex].id]);
      setSessionStats({
        ...sessionStats,
        reviewCount: sessionStats.reviewCount + 1
      });
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
        timeSpent: timer
      });
    }
  };

  // Start a new session with the words marked for review
  const reviewMissedWords = () => {
    const reviewCards = cards.filter(card => reviewLaterWords.includes(card.id));
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
      timeSpent: 0
    });
    setTimer(0);
  };

  // Restart with all words
  const restartSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setReviewLaterWords([]);
    setSessionComplete(false);
    setSessionStats({
      ...sessionStats,
      knownCount: 0,
      reviewCount: 0,
      timeSpent: 0
    });
    setTimer(0);
  };

  // Calculate session accuracy
  const calculateAccuracy = () => {
    if (sessionStats.totalCards === 0) return 0;
    return Math.round((sessionStats.knownCount / sessionStats.totalCards) * 100);
  };

  return (
    <div className="vocabulary-flashcards-container">
      <div className="flashcards-header">
        <h2>Vocabulary Flashcards</h2>
        {!sessionComplete && (
          <div className="session-progress">
            <div className="progress-text">
              <span>{currentCardIndex + 1} / {cards.length}</span>
              <span className="session-timer">{formatTime(timer)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentCardIndex / (cards.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {!sessionComplete && cards.length > 0 ? (
        <div className="flashcard-content">
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
            <div className="flashcard-front">
              <div className="word">{cards[currentCardIndex].word}</div>
              {showHint && (
                <div className="hint-container">
                  <div className="hint-label">Hint:</div>
                  <div className="hint-text">{cards[currentCardIndex].hint}</div>
                </div>
              )}
            </div>
            <div className="flashcard-back">
              <div className="translation">{cards[currentCardIndex].translation}</div>
              <div className="example">{cards[currentCardIndex].example}</div>
            </div>
          </div>

          <div className="flashcard-actions">
            <button className="hint-button" onClick={toggleHint} disabled={isFlipped}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <div className="knowledge-actions">
              <button className="review-button" onClick={handleReviewLater}>
                <span className="button-icon">🔄</span>
                Review Later
              </button>
              <button className="know-button" onClick={handleKnowCard}>
                <span className="button-icon">✓</span>
                I Know This
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
              <div className="result-value">{formatTime(sessionStats.timeSpent)}</div>
            </div>
          </div>

          <div className="result-actions">
            {sessionStats.reviewCount > 0 && (
              <button className="review-missed-button" onClick={reviewMissedWords}>
                Practice Review Words ({sessionStats.reviewCount})
              </button>
            )}
            <button className="restart-button" onClick={restartSession}>
              Restart with All Words
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