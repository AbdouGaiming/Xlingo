import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LessonPractice.scss";

const LessonPractice = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [exerciseData, setExerciseData] = useState([]);
  const [isExerciseComplete, setIsExerciseComplete] = useState(false);
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Fetch lesson data from localStorage (set by LessonsAdventure component)
  useEffect(() => {
    const storedLesson = localStorage.getItem("currentLesson");

    if (storedLesson) {
      const parsedLesson = JSON.parse(storedLesson);
      setLesson(parsedLesson);

      // Generate exercise data based on lesson type
      generateExerciseContent(parsedLesson);
    } else {
      // If no lesson data in localStorage, try to fetch by lessonId
      console.log(`No lesson data found for lesson ID: ${lessonId}`);
      // For now, navigate back if no data is found
      navigate("/lessons-adventure");
    }
  }, [lessonId, navigate]);

  // Generate mock exercise content based on lesson type
  const generateExerciseContent = (lesson) => {
    // Create different exercises based on the lesson type
    let exercises = [];

    switch (lesson.lessonType) {
      case "vocabulary":
        exercises = [
          {
            type: "matching",
            question: "Match the words with their meanings",
            options: [
              { id: 1, text: "Hello", translation: "Hola" },
              { id: 2, text: "Goodbye", translation: "Adiós" },
              { id: 3, text: "Thank you", translation: "Gracias" },
              { id: 4, text: "Please", translation: "Por favor" },
            ],
            correctAnswer: [1, 2, 3, 4],
          },
          {
            type: "multipleChoice",
            question: 'What does "Buenos días" mean?',
            options: [
              "Good afternoon",
              "Good evening",
              "Good morning",
              "Good night",
            ],
            correctAnswer: 2,
          },
          {
            type: "fillBlank",
            question: 'Complete the sentence: "Me _____ Juan"',
            options: ["llamo", "llamas", "llama", "llaman"],
            correctAnswer: 0,
          },
        ];
        break;

      case "grammar":
        exercises = [
          {
            type: "multipleChoice",
            question: 'Choose the correct verb form: "Yo ____ a la escuela"',
            options: ["va", "vas", "voy", "van"],
            correctAnswer: 2,
          },
          {
            type: "arrangement",
            question: "Arrange the words to form a correct sentence",
            options: ["ella", "estudia", "universidad", "en", "la"],
            correctAnswer: [0, 1, 3, 4, 2],
          },
          {
            type: "fillBlank",
            question:
              'Complete with the right article: "____ libro es interesante"',
            options: ["El", "La", "Los", "Las"],
            correctAnswer: 0,
          },
        ];
        break;

      case "conversation":
        exercises = [
          {
            type: "dialog",
            question: "Choose the appropriate response",
            prompt: "Person A: ¿Cómo estás?",
            options: [
              "Mucho gusto",
              "Estoy bien, gracias",
              "Buenos días",
              "Me llamo Juan",
            ],
            correctAnswer: 1,
          },
          {
            type: "dialog",
            question: "Complete the conversation",
            prompt: "Person A: ¿De dónde eres?",
            options: [
              "Soy de España",
              "Me gusta el café",
              "Tengo veinte años",
              "Hasta luego",
            ],
            correctAnswer: 0,
          },
          {
            type: "roleplay",
            question: "Which phrase would you use to order food?",
            options: [
              "Quiero un café, por favor",
              "¿Qué hora es?",
              "¿Dónde está el baño?",
              "Mucho gusto",
            ],
            correctAnswer: 0,
          },
        ];
        break;

      case "listening":
        exercises = [
          {
            type: "listening",
            question: "Listen and select what you hear",
            audioUrl: "https://example.com/audio/sample1.mp3", // These would be actual audio files in production
            options: [
              "Me gusta leer",
              "Me gusta comer",
              "Me gusta beber",
              "Me gusta escribir",
            ],
            correctAnswer: 0,
          },
          {
            type: "dictation",
            question: "Listen and type what you hear",
            audioUrl: "https://example.com/audio/sample2.mp3",
            correctAnswer: "Buenos días",
          },
          {
            type: "listening",
            question: "What is the conversation about?",
            audioUrl: "https://example.com/audio/sample3.mp3",
            options: [
              "Ordering food",
              "Asking for directions",
              "Introducing oneself",
              "Talking about weather",
            ],
            correctAnswer: 2,
          },
        ];
        break;

      case "reading":
        exercises = [
          {
            type: "reading",
            question: "Read the text and answer the question",
            text: "María es de España. Ella vive en Madrid y trabaja como profesora de inglés.",
            prompt: "What is María's profession?",
            options: ["Student", "Doctor", "English teacher", "Engineer"],
            correctAnswer: 2,
          },
          {
            type: "comprehension",
            question: "Read and select the correct statement",
            text: "Pedro se levanta a las 7 de la mañana. Desayuna café con tostadas y sale de casa a las 8.",
            options: [
              "Pedro wakes up at 8 AM",
              "Pedro has coffee and toast for breakfast",
              "Pedro leaves home at 7 AM",
              "Pedro doesn't eat breakfast",
            ],
            correctAnswer: 1,
          },
          {
            type: "matching",
            question: "Match the Spanish words with their English translations",
            options: [
              { id: 1, text: "Libro", translation: "Book" },
              { id: 2, text: "Casa", translation: "House" },
              { id: 3, text: "Perro", translation: "Dog" },
              { id: 4, text: "Agua", translation: "Water" },
            ],
            correctAnswer: [1, 2, 3, 4],
          },
        ];
        break;

      default:
        exercises = [
          {
            type: "multipleChoice",
            question: "Sample question 1",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 0,
          },
          {
            type: "multipleChoice",
            question: "Sample question 2",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 1,
          },
          {
            type: "multipleChoice",
            question: "Sample question 3",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 2,
          },
        ];
    }

    setExerciseData(exercises);
    // Initialize answers array with empty values
    setAnswers(new Array(exercises.length).fill(null));
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = answerIndex;
    setAnswers(newAnswers);

    // Clear any previous feedback
    setFeedback("");
  };

  // Handle multiple selection (for matching exercises)
  const handleMultipleSelect = (optionId) => {
    const currentAnswerArray = Array.isArray(answers[currentStep])
      ? [...answers[currentStep]]
      : [];

    // Toggle selection
    const index = currentAnswerArray.indexOf(optionId);
    if (index > -1) {
      currentAnswerArray.splice(index, 1);
    } else {
      currentAnswerArray.push(optionId);
    }

    const newAnswers = [...answers];
    newAnswers[currentStep] = currentAnswerArray;
    setAnswers(newAnswers);
  };

  // Handle arrangement answers (drag and drop simulation)
  const handleArrangementSelect = (index) => {
    const currentArrangement = Array.isArray(answers[currentStep])
      ? [...answers[currentStep]]
      : [];

    // Toggle selection in arrangement
    if (currentArrangement.includes(index)) {
      const newArrangement = currentArrangement.filter((i) => i !== index);
      const newAnswers = [...answers];
      newAnswers[currentStep] = newArrangement;
      setAnswers(newAnswers);
    } else {
      const newArrangement = [...currentArrangement, index];
      const newAnswers = [...answers];
      newAnswers[currentStep] = newArrangement;
      setAnswers(newAnswers);
    }
  };

  // Handle text input for dictation exercises
  const handleTextInput = (event) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = event.target.value;
    setAnswers(newAnswers);
  };

  // Handle audio playback
  const toggleAudio = () => {
    const audio = audioRef.current;

    if (audio) {
      if (isAudioPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // Check if the current answer is correct
  const checkAnswer = () => {
    if (!exerciseData[currentStep]) return;

    const currentExercise = exerciseData[currentStep];
    const userAnswer = answers[currentStep];

    // Skip validation if no answer provided
    if (
      userAnswer === null ||
      userAnswer === undefined ||
      (Array.isArray(userAnswer) && userAnswer.length === 0)
    ) {
      setFeedback("Please select an answer before continuing.");
      return;
    }

    let isCorrect = false;

    // Different validation logic based on exercise type
    if (Array.isArray(currentExercise.correctAnswer)) {
      // For matching or arrangement exercises
      if (Array.isArray(userAnswer)) {
        if (currentExercise.type === "arrangement") {
          // For arrangement, check if the order is correct
          isCorrect =
            userAnswer.length === currentExercise.correctAnswer.length &&
            userAnswer.every(
              (val, idx) => val === currentExercise.correctAnswer[idx]
            );
        } else {
          // For matching, check if all matches are correct (order doesn't matter)
          isCorrect =
            userAnswer.length === currentExercise.correctAnswer.length &&
            currentExercise.correctAnswer.every((val) =>
              userAnswer.includes(val)
            );
        }
      }
    } else if (currentExercise.type === "dictation") {
      // For dictation, normalize strings and compare
      const normalizedUserAnswer = userAnswer.toLowerCase().trim();
      const normalizedCorrectAnswer = currentExercise.correctAnswer
        .toLowerCase()
        .trim();
      isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    } else {
      // For multiple choice and other simple exercises
      isCorrect = userAnswer === currentExercise.correctAnswer;
    }

    // Update score and give feedback
    if (isCorrect) {
      setScore(score + 1);
      setFeedback("Correct! 🎉");
    } else {
      setFeedback("Not quite right. Try again!");
    }

    // Allow proceeding to next question after checking
    if (currentStep < exerciseData.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setFeedback("");
      }, 1500);
    } else {
      // Show results if this was the last question
      setTimeout(() => {
        setShowResults(true);
        setIsExerciseComplete(true);
      }, 1500);
    }
  };

  // Handle completion of lesson
  const handleCompletion = () => {
    const finalScore = Math.round((score / exerciseData.length) * 100);

    // Update lesson status in localStorage (in a real app, this would be sent to the server)
    if (finalScore >= 70) {
      // Mark lesson as completed if score is 70% or higher
      // In a real app, this would call an API to update the user's progress
      console.log(`Lesson ${lessonId} completed with score: ${finalScore}%`);
    }

    // Navigate back to the adventure map
    navigate(`/lessons-adventure/${lessonId}`);
  };

  // Loading state
  if (!lesson || exerciseData.length === 0) {
    return (
      <div className="lesson-practice loading">Loading lesson content...</div>
    );
  }

  // Render different exercise types
  const renderExercise = () => {
    if (!exerciseData[currentStep]) return null;

    const exercise = exerciseData[currentStep];
    const userAnswer = answers[currentStep];

    switch (exercise.type) {
      case "multipleChoice":
      case "dialog":
      case "roleplay":
      case "listening":
        return (
          <div className="exercise multiple-choice">
            {exercise.audioUrl && (
              <div className="audio-player">
                <audio ref={audioRef} src={exercise.audioUrl} />
                <button
                  className={`play-button ${isAudioPlaying ? "playing" : ""}`}
                  onClick={toggleAudio}
                >
                  {isAudioPlaying ? "❚❚" : "▶"}
                </button>
                <span className="audio-hint">Click to play audio</span>
              </div>
            )}

            {exercise.text && (
              <div className="text-content">
                <div className="reading-text">{exercise.text}</div>
              </div>
            )}

            {exercise.prompt && <p className="prompt">{exercise.prompt}</p>}

            <div className="options">
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${userAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case "fillBlank":
        return (
          <div className="exercise fill-blank">
            <div className="options">
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${userAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case "matching":
        return (
          <div className="exercise matching">
            <div className="matching-pairs">
              {exercise.options.map((option) => (
                <div
                  key={option.id}
                  className={`matching-pair ${
                    Array.isArray(userAnswer) && userAnswer.includes(option.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleMultipleSelect(option.id)}
                >
                  <div className="term">{option.text}</div>
                  <div className="definition">{option.translation}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "arrangement":
        const arrangedOptions = [...exercise.options];
        // Show the user's arrangement if they've started arranging
        if (Array.isArray(userAnswer) && userAnswer.length > 0) {
          const arrangedOrder = [];
          userAnswer.forEach((index) => {
            arrangedOrder.push(exercise.options[index]);
          });

          // Fill in the rest of the options that haven't been selected
          exercise.options.forEach((option, index) => {
            if (!userAnswer.includes(index)) {
              arrangedOrder.push(option);
            }
          });
        }

        return (
          <div className="exercise arrangement">
            <div className="arrangement-area">
              <div className="arranged-words">
                {Array.isArray(userAnswer) &&
                  userAnswer.map((optionIndex, index) => (
                    <div
                      key={index}
                      className="arranged-word"
                      onClick={() => handleArrangementSelect(optionIndex)}
                    >
                      {exercise.options[optionIndex]}
                    </div>
                  ))}
              </div>

              <div className="available-words">
                {exercise.options.map((option, index) =>
                  !Array.isArray(userAnswer) || !userAnswer.includes(index) ? (
                    <div
                      key={index}
                      className="available-word"
                      onClick={() => handleArrangementSelect(index)}
                    >
                      {option}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        );

      case "dictation":
        return (
          <div className="exercise dictation">
            <div className="audio-player">
              <audio ref={audioRef} src={exercise.audioUrl} />
              <button
                className={`play-button ${isAudioPlaying ? "playing" : ""}`}
                onClick={toggleAudio}
              >
                {isAudioPlaying ? "❚❚" : "▶"}
              </button>
              <span className="audio-hint">Listen and type what you hear</span>
            </div>

            <div className="input-area">
              <input
                type="text"
                value={userAnswer || ""}
                onChange={handleTextInput}
                placeholder="Type what you hear..."
                className="dictation-input"
              />
            </div>
          </div>
        );

      case "reading":
      case "comprehension":
        return (
          <div className="exercise reading">
            <div className="text-content">
              <div className="reading-text">{exercise.text}</div>
            </div>

            {exercise.prompt && <p className="prompt">{exercise.prompt}</p>}

            <div className="options">
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${userAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="exercise default">
            <div className="options">
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${userAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="lesson-practice-container">
      {/* Header with lesson info and progress */}
      <div className="lesson-header">
        <button
          className="back-button"
          onClick={() => navigate("/lessons-adventure")}
        >
          <span className="back-arrow">←</span> Back to Map
        </button>

        <div className="lesson-info">
          <h2>{lesson.title}</h2>
          <p>{lesson.description}</p>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentStep + 1) / exerciseData.length) * 100}%`,
              }}
            ></div>
          </div>
          <span className="progress-text">
            {currentStep + 1} of {exerciseData.length}
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="lesson-content">
        {showResults ? (
          <div className="results-screen">
            <div className="results-header">
              <h2>Lesson Complete!</h2>
              <div className="lesson-icon">{lesson.icon}</div>
            </div>

            <div className="score-display">
              <div className="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="8"
                    strokeDasharray={`${Math.round(
                      (score / exerciseData.length) * 283
                    )} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="score-percentage">
                  {Math.round((score / exerciseData.length) * 100)}%
                </span>
              </div>
              <p>
                You got {score} out of {exerciseData.length} correct!
              </p>
            </div>

            <div className="xp-reward">
              <span className="xp-badge">+{lesson.xpReward} XP</span>
              <p>Good job! You've earned {lesson.xpReward} XP.</p>
            </div>

            <div className="action-buttons">
              <button
                className="practice-again"
                onClick={() => {
                  setCurrentStep(0);
                  setScore(0);
                  setAnswers(new Array(exerciseData.length).fill(null));
                  setShowResults(false);
                }}
              >
                Practice Again
              </button>
              <button className="continue-button" onClick={handleCompletion}>
                Continue Adventure
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="question-area">
              <h3 className="question-text">
                {exerciseData[currentStep]?.question}
              </h3>
              {renderExercise()}
            </div>

            <div className="answer-feedback">
              {feedback && (
                <p
                  className={`feedback ${
                    feedback.includes("Correct") ? "correct" : ""
                  }`}
                >
                  {feedback}
                </p>
              )}
            </div>

            <div className="controls">
              <button
                className={`check-answer ${
                  answers[currentStep] !== null ? "active" : "disabled"
                }`}
                onClick={checkAnswer}
                disabled={answers[currentStep] === null}
              >
                {currentStep < exerciseData.length - 1
                  ? "Check & Continue"
                  : "Check & Finish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonPractice;
