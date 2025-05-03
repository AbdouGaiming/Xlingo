import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LessonPractice.scss";
import {
  generateLesson,
  generateVocabulary,
  generatePronunciationExercises,
  practiceConversation,
  translateText,
  correctGrammar,
  getLearningTips,
} from "../../services/GeminiService";
import {
  showSuccessAlert,
  showErrorAlert,
  showAlert,
  closeAlert,
} from "../../components/shared/SweetAlert/SweetAlert";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // New states for interactive conversation
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeConversationScenario, setActiveConversationScenario] =
    useState(null);
  const [showTranslationPanel, setShowTranslationPanel] = useState(false);
  const [translationInput, setTranslationInput] = useState("");
  const [translationResult, setTranslationResult] = useState(null);
  const [showGrammarPanel, setShowGrammarPanel] = useState(false);
  const [grammarInput, setGrammarInput] = useState("");
  const [grammarResult, setGrammarResult] = useState(null);
  const [learningTips, setLearningTips] = useState([]);
  const [alertTimeout, setAlertTimeout] = useState(null);

  // Fetch lesson data from localStorage (set by LessonsAdventure component)
  useEffect(() => {
    const storedLesson = localStorage.getItem("currentLesson");

    if (storedLesson) {
      const parsedLesson = JSON.parse(storedLesson);
      setLesson(parsedLesson);

      // Generate exercise content based on lesson type
      generateExerciseContent(parsedLesson);

      // Load learning tips for this lesson
      loadLearningTips(parsedLesson);
    } else {
      // If no lesson data in localStorage, try to fetch by lessonId
      console.log(`No lesson data found for lesson ID: ${lessonId}`);
      // For now, navigate back if no data is found
      navigate("/lessons-adventure");
    }
  }, [lessonId, navigate]);

  // Clean up any open alerts when component unmounts
  useEffect(() => {
    return () => {
      if (alertTimeout) clearTimeout(alertTimeout);
      closeAlert();
    };
  }, [alertTimeout]);

  // Load learning tips for the lesson with proper error handling
  const loadLearningTips = async (lesson) => {
    try {
      const language = lesson.language || "Spanish";
      const level = lesson.level || "Beginner";
      const topic = lesson.topic || lesson.lessonType;

      console.log(
        `Loading learning tips for ${language} (${level}) on topic: ${topic}`
      );
      const tips = await getLearningTips(language, level, topic);
      console.log("Learning tips received:", tips);

      if (tips && tips.length > 0) {
        setLearningTips(tips);
      } else {
        throw new Error("No learning tips received");
      }
    } catch (error) {
      console.error("Failed to load learning tips:", error);
      setLearningTips([
        {
          title: "Practice regularly",
          description: "Consistency is key to language learning.",
          example: "Set aside 15 minutes every day for practice.",
        },
        {
          title: "Use flashcards",
          description: "Spaced repetition helps with vocabulary retention.",
          example: "Create flashcards for new words you encounter.",
        },
        {
          title: "Immerse yourself",
          description: "Try to surround yourself with the language.",
          example: "Watch shows or listen to music in your target language.",
        },
      ]);
    }
  };

  // Generate exercise content based on lesson type using Gemini API
  const generateExerciseContent = async (lesson) => {
    setIsLoading(true);
    setError(null);

    try {
      let exercises = [];
      const language = lesson.language || "Spanish"; // Default to Spanish if not specified
      const level = lesson.level || "Beginner"; // Default to Beginner if not specified
      const topic = lesson.topic || lesson.title || "general vocabulary"; // Use topic, fall back to title or default

      console.log(
        `Generating exercises for ${language} (${level}) on topic: ${topic}`
      );

      switch (lesson.lessonType) {
        case "vocabulary":
          // Use Gemini API to generate vocabulary exercises
          const vocabData = await generateVocabulary(language, topic, 8);
          console.log("Vocabulary data received:", vocabData);

          if (vocabData && Array.isArray(vocabData) && vocabData.length > 0) {
            // Create matching exercise from generated vocabulary
            const matchingExercise = {
              type: "matching",
              question: `Match these ${language} words with their meanings`,
              options: vocabData.slice(0, 4).map((item, index) => ({
                id: index + 1,
                text: item.word,
                translation: item.translation,
              })),
              correctAnswer: [1, 2, 3, 4],
            };

            // Create multiple choice exercises from generated vocabulary
            const multipleChoiceExercises = vocabData
              .slice(0, 4)
              .map((item, index) => {
                // Generate random incorrect answers
                const incorrectOptions = vocabData
                  .filter((v) => v.word !== item.word)
                  .map((v) => v.translation)
                  .slice(0, 3);

                const options = [...incorrectOptions, item.translation];
                // Shuffle options
                const shuffledOptions = options.sort(() => Math.random() - 0.5);

                return {
                  type: "multipleChoice",
                  question: `What does "${item.word}" mean in ${language}?`,
                  options: shuffledOptions,
                  correctAnswer: shuffledOptions.indexOf(item.translation),
                };
              });

            exercises = [matchingExercise, ...multipleChoiceExercises];
          } else {
            throw new Error(
              "Failed to generate vocabulary exercises or received empty response"
            );
          }
          break;

        case "grammar":
          // Use Gemini API to generate a complete lesson with grammar exercises
          const lessonData = await generateLesson(language, level, topic);
          console.log("Grammar lesson data received:", lessonData);

          if (
            lessonData &&
            lessonData.exercises &&
            Array.isArray(lessonData.exercises) &&
            lessonData.exercises.length > 0
          ) {
            // Extract grammar exercises from the lesson data
            exercises = lessonData.exercises.map((ex, index) => {
              if (
                ex.type === "multiple-choice" &&
                Array.isArray(ex.options) &&
                ex.options.length > 0
              ) {
                return {
                  type: "multipleChoice",
                  question:
                    ex.question ||
                    `Grammar question about ${topic} in ${language}`,
                  options: ex.options,
                  correctAnswer: ex.options.indexOf(ex.correctAnswer),
                };
              } else if (
                ex.type === "fill-in-blank" &&
                ex.sentence &&
                ex.correctAnswer
              ) {
                // For fill-in-blank, create options from the sentence
                const words = ex.correctAnswer.split(" ");
                const shuffledWords = [...words]
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 4);

                return {
                  type: "fillBlank",
                  question:
                    ex.sentence ||
                    `Fill in the blank with the correct ${language} word`,
                  options: shuffledWords,
                  correctAnswer: 0, // First option is correct
                };
              }

              // Default if exercise format is unexpected
              return {
                type: "multipleChoice",
                question: `${language} grammar question ${
                  index + 1
                } about ${topic}`,
                options: [
                  `${language} answer option 1`,
                  `${language} answer option 2`,
                  `${language} answer option 3`,
                  `${language} answer option 4`,
                ],
                correctAnswer: 0,
              };
            });

            // If there's grammar explanation, add it as a reading exercise
            if (lessonData.grammar && lessonData.grammar.rule) {
              const grammarExamples =
                lessonData.grammar.examples &&
                Array.isArray(lessonData.grammar.examples)
                  ? lessonData.grammar.examples.join("\n\n")
                  : "";

              const grammarExplanation = {
                type: "reading",
                question: `${language} Grammar Rule: ${topic}`,
                text: `${lessonData.grammar.rule}\n\n${grammarExamples}`,
                options: [
                  "I understand",
                  "Show me examples",
                  "Let me practice",
                ],
                correctAnswer: 0, // All answers are acceptable
              };

              exercises.unshift(grammarExplanation);
            }
          } else {
            throw new Error(
              "Failed to generate grammar exercises or received invalid format"
            );
          }
          break;

        case "pronunciation":
          // Use Gemini API to generate pronunciation exercises
          const pronunciationData = await generatePronunciationExercises(
            language,
            level
          );
          console.log("Pronunciation data received:", pronunciationData);

          if (
            pronunciationData &&
            Array.isArray(pronunciationData) &&
            pronunciationData.length > 0
          ) {
            exercises = pronunciationData.map((item, index) => ({
              type: "multipleChoice",
              question: `How to pronounce: "${item.sound}" in ${language}`,
              prompt: item.explanation,
              options:
                item.examples && Array.isArray(item.examples)
                  ? item.examples
                  : [
                      `${language} pronunciation example 1`,
                      `${language} pronunciation example 2`,
                      `${language} pronunciation example 3`,
                      `${language} pronunciation example 4`,
                    ],
              correctAnswer: 0, // First example is correct
            }));
          } else {
            throw new Error(
              "Failed to generate pronunciation exercises or received invalid format"
            );
          }
          break;

        case "conversation":
          // Use Gemini API to generate conversation exercises
          const conversationData = await generateLesson(
            language,
            level,
            "conversation practice"
          );
          console.log("Conversation data received:", conversationData);

          // Setup conversation scenarios
          const conversationScenarios = [
            {
              name: "At a Restaurant",
              description: `Practice ordering food and talking to the server in ${language}.`,
            },
            {
              name: "Meeting Someone New",
              description: `Practice introducing yourself and making small talk in ${language}.`,
            },
            {
              name: "Shopping",
              description: `Practice asking about products and making purchases in ${language}.`,
            },
            {
              name: "Asking for Directions",
              description: `Practice asking for and understanding directions in ${language}.`,
            },
          ];

          // Set the active scenario to the first one
          setActiveConversationScenario(conversationScenarios[0]);

          if (
            conversationData &&
            conversationData.conversationPractice &&
            Array.isArray(conversationData.conversationPractice) &&
            conversationData.conversationPractice.length > 0
          ) {
            // Create dialogue exercises from conversation practice
            const dialogExercises = [];

            for (
              let i = 0;
              i < conversationData.conversationPractice.length - 1;
              i++
            ) {
              const current = conversationData.conversationPractice[i];
              const next = conversationData.conversationPractice[i + 1];

              // Only create exercises where user needs to respond to speaker1
              if (
                current.role === "speaker1" &&
                next.role === "speaker2" &&
                current.text &&
                next.text
              ) {
                // Generate incorrect responses for the multiple choice
                const incorrectResponses = conversationData.conversationPractice
                  .filter(
                    (dialog) =>
                      dialog.role === "speaker2" && dialog.text !== next.text
                  )
                  .map((dialog) => dialog.text)
                  .slice(0, 3);

                // If we don't have enough incorrect responses, add some generic ones
                while (incorrectResponses.length < 3) {
                  incorrectResponses.push(
                    language === "Spanish"
                      ? "No entiendo."
                      : language === "French"
                      ? "Je ne comprends pas."
                      : "I don't understand."
                  );
                }

                const options = [...incorrectResponses, next.text];
                // Shuffle options
                const shuffledOptions = options.sort(() => Math.random() - 0.5);

                dialogExercises.push({
                  type: "dialog",
                  question: `Choose the appropriate ${language} response`,
                  prompt: current.text,
                  options: shuffledOptions,
                  correctAnswer: shuffledOptions.indexOf(next.text),
                });
              }
            }

            // Add interactive conversation exercise at the end
            exercises = [
              ...dialogExercises,
              {
                type: "interactive_conversation",
                question: `Practice real-time ${language} conversation with AI`,
                scenarios: conversationScenarios,
                activeScenario: conversationScenarios[0],
              },
            ];
          } else {
            throw new Error(
              "Failed to generate conversation exercises or received invalid format"
            );
          }
          break;

        case "reading":
          // Generate reading comprehension exercise
          const readingData = await generateLesson(
            language,
            level,
            "reading comprehension"
          );
          console.log("Reading data received:", readingData);

          if (readingData && readingData.introduction) {
            // Create a reading comprehension exercise from the introduction
            const readingText = readingData.introduction;

            // Create comprehension questions
            const comprehensionExercise = {
              type: "reading",
              question: `Read this ${language} text and answer the questions`,
              text: readingText,
              options: [
                "I understand",
                "I need to read again",
                "Let's practice",
              ],
              correctAnswer: 0, // All answers are acceptable
            };

            // Create vocabulary multiple choice from the lesson vocabulary
            const vocabExercises =
              readingData.vocabulary && Array.isArray(readingData.vocabulary)
                ? readingData.vocabulary.slice(0, 3).map((item, index) => {
                    const incorrectOptions = readingData.vocabulary
                      .filter((v) => v.word !== item.word)
                      .map((v) => v.translation)
                      .slice(0, 3);

                    const options = [...incorrectOptions, item.translation];
                    const shuffledOptions = options.sort(
                      () => Math.random() - 0.5
                    );

                    return {
                      type: "multipleChoice",
                      question: `From the ${language} reading, what does "${item.word}" mean?`,
                      options: shuffledOptions,
                      correctAnswer: shuffledOptions.indexOf(item.translation),
                    };
                  })
                : [];

            exercises = [comprehensionExercise, ...vocabExercises];
          } else {
            throw new Error(
              "Failed to generate reading exercises or missing introduction"
            );
          }
          break;

        default:
          // Generate a general language practice lesson
          const generalLessonData = await generateLesson(
            language,
            level,
            topic
          );
          console.log("General lesson data received:", generalLessonData);

          if (generalLessonData) {
            // Extract exercises from vocabulary if available
            if (
              generalLessonData.vocabulary &&
              Array.isArray(generalLessonData.vocabulary)
            ) {
              const vocabExercises = generalLessonData.vocabulary
                .slice(0, 3)
                .map((item, index) => {
                  const incorrectOptions = generalLessonData.vocabulary
                    .filter((v) => v.word !== item.word)
                    .map((v) => v.translation)
                    .slice(0, 3);

                  const options = [...incorrectOptions, item.translation];
                  const shuffledOptions = options.sort(
                    () => Math.random() - 0.5
                  );

                  return {
                    type: "multipleChoice",
                    question: `What does the ${language} word "${item.word}" mean?`,
                    options: shuffledOptions,
                    correctAnswer: shuffledOptions.indexOf(item.translation),
                  };
                });

              exercises = [...vocabExercises];
            }

            // Add any available exercises from the lesson data
            if (
              generalLessonData.exercises &&
              Array.isArray(generalLessonData.exercises)
            ) {
              const additionalExercises = generalLessonData.exercises
                .map((ex, index) => {
                  if (
                    ex.type === "multiple-choice" &&
                    Array.isArray(ex.options)
                  ) {
                    return {
                      type: "multipleChoice",
                      question:
                        ex.question ||
                        `${language} practice question ${index + 1}`,
                      options: ex.options,
                      correctAnswer: ex.options.indexOf(ex.correctAnswer),
                    };
                  }
                  return null;
                })
                .filter((ex) => ex !== null);

              exercises = [...exercises, ...additionalExercises];
            }

            // If we still don't have enough exercises, add some reading content
            if (exercises.length < 2 && generalLessonData.introduction) {
              exercises.unshift({
                type: "reading",
                question: `Learn about ${topic} in ${language}`,
                text: generalLessonData.introduction,
                options: ["I understand", "Let's practice", "Show me more"],
                correctAnswer: 0, // All answers are acceptable
              });
            }
          }

          // If we still have no exercises, create default exercises
          if (exercises.length === 0) {
            exercises = [
              {
                type: "multipleChoice",
                question: `${language} practice question about ${topic} (level: ${level})`,
                options: [
                  `${language} answer option 1`,
                  `${language} answer option 2`,
                  `${language} answer option 3`,
                  `${language} answer option 4`,
                ],
                correctAnswer: 0,
              },
              {
                type: "multipleChoice",
                question: `Another ${language} question about ${topic}`,
                options: [
                  `${language} answer option 1`,
                  `${language} answer option 2`,
                  `${language} answer option 3`,
                  `${language} answer option 4`,
                ],
                correctAnswer: 1,
              },
            ];
          }
      }

      // Add translation and grammar correction tools for all lesson types
      exercises.push({
        type: "tools",
        question: `Extra ${language} Practice Tools`,
        tools: [
          {
            id: "translator",
            name: "Translator",
            description: `Translate text between English and ${language}`,
          },
          {
            id: "grammar_check",
            name: "Grammar Check",
            description: `Check and correct your ${language} grammar`,
          },
        ],
      });

      setExerciseData(exercises);
      // Initialize answers array with empty values
      setAnswers(new Array(exercises.length).fill(null));
    } catch (error) {
      console.error("Error generating exercise content:", error);
      setError(
        `Failed to generate ${lesson.language} lesson content: ${error.message}. Using default content instead.`
      );

      // Fall back to language-specific mock data if API fails
      const language = lesson.language || "Spanish";
      const topic = lesson.topic || lesson.title || "language basics";
      const fallbackExercises = createFallbackExercises(
        language,
        topic,
        lesson.lessonType
      );

      setExerciseData(fallbackExercises);
      setAnswers(new Array(fallbackExercises.length).fill(null));
    } finally {
      setIsLoading(false);
    }
  };

  // Create fallback exercises for when API fails
  const createFallbackExercises = (language, topic, lessonType) => {
    // Create exercises based on language
    const languageMap = {
      Spanish: {
        vocabulary: [
          { word: "hola", translation: "hello" },
          { word: "adiós", translation: "goodbye" },
          { word: "gracias", translation: "thank you" },
          { word: "por favor", translation: "please" },
        ],
        questions: [
          {
            question: "What does 'gracias' mean?",
            options: ["hello", "thank you", "goodbye", "please"],
            correctAnswer: 1,
          },
          {
            question: "How do you say 'hello' in Spanish?",
            options: ["adiós", "hola", "gracias", "por favor"],
            correctAnswer: 1,
          },
        ],
      },
      French: {
        vocabulary: [
          { word: "bonjour", translation: "hello" },
          { word: "au revoir", translation: "goodbye" },
          { word: "merci", translation: "thank you" },
          { word: "s'il vous plaît", translation: "please" },
        ],
        questions: [
          {
            question: "What does 'merci' mean?",
            options: ["hello", "thank you", "goodbye", "please"],
            correctAnswer: 1,
          },
          {
            question: "How do you say 'hello' in French?",
            options: ["au revoir", "bonjour", "merci", "s'il vous plaît"],
            correctAnswer: 1,
          },
        ],
      },
      German: {
        vocabulary: [
          { word: "hallo", translation: "hello" },
          { word: "auf wiedersehen", translation: "goodbye" },
          { word: "danke", translation: "thank you" },
          { word: "bitte", translation: "please" },
        ],
        questions: [
          {
            question: "What does 'danke' mean?",
            options: ["hello", "thank you", "goodbye", "please"],
            correctAnswer: 1,
          },
          {
            question: "How do you say 'hello' in German?",
            options: ["auf wiedersehen", "hallo", "danke", "bitte"],
            correctAnswer: 1,
          },
        ],
      },
    };

    // Default to Spanish if language not found
    const langData = languageMap[language] || languageMap["Spanish"];

    // Create exercises based on lesson type
    let exercises = [];

    if (lessonType === "vocabulary" || lessonType === "reading") {
      // Create matching exercise
      exercises.push({
        type: "matching",
        question: `Match these ${language} words with their meanings`,
        options: langData.vocabulary.map((item, index) => ({
          id: index + 1,
          text: item.word,
          translation: item.translation,
        })),
        correctAnswer: [1, 2, 3, 4],
      });

      // Add vocabulary questions
      exercises = [
        ...exercises,
        ...langData.questions.map((q) => ({
          type: "multipleChoice",
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      ];
    } else if (lessonType === "grammar") {
      exercises = [
        {
          type: "reading",
          question: `Basic ${language} Grammar`,
          text: `This is a sample grammar lesson about ${topic} in ${language}. In a real lesson, you would see actual grammar rules here.`,
          options: ["I understand", "Let's practice", "Show examples"],
          correctAnswer: 0,
        },
        ...langData.questions.map((q) => ({
          type: "multipleChoice",
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      ];
    } else if (lessonType === "conversation") {
      const conversationScenarios = [
        {
          name: "At a Restaurant",
          description: `Practice ordering food and talking to the server in ${language}.`,
        },
        {
          name: "Meeting Someone New",
          description: `Practice introducing yourself in ${language}.`,
        },
      ];

      exercises = [
        {
          type: "dialog",
          question: `Choose the appropriate ${language} response`,
          prompt:
            language === "Spanish"
              ? "¿Cómo estás?"
              : language === "French"
              ? "Comment allez-vous?"
              : language === "German"
              ? "Wie geht es dir?"
              : "How are you?",
          options:
            language === "Spanish"
              ? ["Mucho gusto", "Estoy bien, gracias", "Adiós", "No sé"]
              : language === "French"
              ? [
                  "Enchanté",
                  "Je vais bien, merci",
                  "Au revoir",
                  "Je ne sais pas",
                ]
              : language === "German"
              ? [
                  "Sehr erfreut",
                  "Mir geht es gut, danke",
                  "Auf Wiedersehen",
                  "Ich weiß nicht",
                ]
              : [
                  "Nice to meet you",
                  "I'm fine, thank you",
                  "Goodbye",
                  "I don't know",
                ],
          correctAnswer: 1,
        },
        {
          type: "interactive_conversation",
          question: `Practice real-time ${language} conversation with AI`,
          scenarios: conversationScenarios,
          activeScenario: conversationScenarios[0],
        },
      ];
    } else {
      // Default exercises
      exercises = langData.questions.map((q) => ({
        type: "multipleChoice",
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));
    }

    return exercises;
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

  // Handle conversation input change
  const handleConversationInput = (e) => {
    setUserMessage(e.target.value);
  };

  // Handle sending a message in conversation practice with proper error handling
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    // Add user message to conversation history
    const newHistory = [
      ...conversationHistory,
      {
        role: "user",
        message: userMessage.trim(),
        timestamp: new Date(),
      },
    ];
    setConversationHistory(newHistory);

    // Clear input and set loading
    setUserMessage("");
    setIsSendingMessage(true);

    try {
      const language = lesson?.language || "Spanish";
      const level = lesson?.level || "Beginner";
      const scenario =
        activeConversationScenario?.name || "General conversation";

      console.log(
        `Sending conversation practice request: ${language}, ${level}, ${scenario}`
      );
      // Get AI response using practiceConversation from GeminiService
      const response = await practiceConversation(
        language,
        level,
        scenario,
        userMessage.trim()
      );
      console.log("Conversation response:", response);

      // Parse and handle the response
      setAiResponse(response);

      // Add AI response to conversation history
      setConversationHistory([
        ...newHistory,
        {
          role: "ai",
          message: response.reply,
          correction: response.correction,
          suggestion: response.suggestion,
          timestamp: new Date(),
        },
      ]);

      // If there's a correction, show feedback
      if (response.correction) {
        setFeedback(response.correction);
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      setFeedback(
        "Sorry, there was an error processing your message. Please try again."
      );

      // Add error message to conversation history
      setConversationHistory([
        ...newHistory,
        {
          role: "ai",
          message:
            "I'm sorry, there was an error processing your message. Please try again.",
          error: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle changing the conversation scenario
  const handleScenarioChange = (scenario) => {
    setActiveConversationScenario(scenario);
    // Reset conversation when scenario changes
    setConversationHistory([]);
    setAiResponse(null);
  };

  // Handle translation with proper error handling
  const handleTranslate = async () => {
    if (!translationInput.trim()) return;

    try {
      const language = lesson?.language || "Spanish";
      const sourceLanguage = "English";
      const targetLanguage = language;
      const includeExplanation = true;

      console.log(
        `Translating from ${sourceLanguage} to ${targetLanguage}: ${translationInput}`
      );
      // Get translation from GeminiService
      const result = await translateText(
        translationInput,
        sourceLanguage,
        targetLanguage,
        includeExplanation
      );
      console.log("Translation result:", result);

      setTranslationResult(result);
    } catch (error) {
      console.error("Error translating:", error);
      setTranslationResult({
        error:
          "Sorry, there was an error translating your text. Please try again.",
        translation: "",
        explanations: null,
      });
    }
  };

  // Handle grammar check with proper error handling
  const handleGrammarCheck = async () => {
    if (!grammarInput.trim()) return;

    try {
      const language = lesson?.language || "Spanish";
      const level = lesson?.level || "Beginner";

      console.log(
        `Checking grammar for ${language} (${level}): ${grammarInput}`
      );
      // Get grammar corrections from GeminiService
      const result = await correctGrammar(grammarInput, language, level);
      console.log("Grammar check result:", result);

      setGrammarResult(result);
    } catch (error) {
      console.error("Error checking grammar:", error);
      setGrammarResult({
        error:
          "Sorry, there was an error checking your grammar. Please try again.",
        correctedText: grammarInput,
        corrections: [],
      });
    }
  };

  // Handle tool selection
  const handleToolSelect = (toolId) => {
    if (toolId === "translator") {
      setShowTranslationPanel(true);
      setShowGrammarPanel(false);
    } else if (toolId === "grammar_check") {
      setShowGrammarPanel(true);
      setShowTranslationPanel(false);
    }
  };

  // Check if the current answer is correct with improved validation
  const checkAnswer = () => {
    if (!exerciseData[currentStep]) return;

    const currentExercise = exerciseData[currentStep];
    const userAnswer = answers[currentStep];

    // Skip validation for certain exercise types
    if (
      currentExercise.type === "interactive_conversation" ||
      currentExercise.type === "tools" ||
      currentExercise.type === "reading"
    ) {
      // Just move to the next step for non-standard exercises
      if (currentStep < exerciseData.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowResults(true);
        setIsExerciseComplete(true);
      }
      return;
    }

    // Skip validation if no answer provided
    if (
      userAnswer === null ||
      userAnswer === undefined ||
      (Array.isArray(userAnswer) && userAnswer.length === 0)
    ) {
      showAlert({
        title: "No Answer Selected",
        text: "Please select an answer before continuing.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    let isCorrect = false;
    let explanation = "";

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
          explanation = isCorrect
            ? "Perfect order!"
            : "The order isn't quite right.";
        } else if (currentExercise.type === "matching") {
          // For matching, check if all matches are correct (order doesn't matter)
          isCorrect = true;
          for (let i = 0; i < currentExercise.options.length; i++) {
            const option = currentExercise.options[i];
            const matchIndex = userAnswer.indexOf(option.id);
            if (matchIndex === -1 || matchIndex !== i) {
              isCorrect = false;
              break;
            }
          }
          explanation = isCorrect
            ? "All matches are correct!"
            : "Some matches are incorrect. Try again.";
        } else {
          // For fill-in-blank
          isCorrect =
            userAnswer.length === currentExercise.correctAnswer.length &&
            userAnswer.every(
              (val, idx) =>
                val.toLowerCase() ===
                currentExercise.correctAnswer[idx].toLowerCase()
            );
          explanation = isCorrect
            ? "Correct fill-in!"
            : "Not quite right. Check your answer.";
        }
      }
    } else if (currentExercise.type === "dictation") {
      // For dictation, normalize strings and compare
      const normalizedUserAnswer = userAnswer.toLowerCase().trim();
      const normalizedCorrectAnswer = currentExercise.correctAnswer
        .toLowerCase()
        .trim();
      isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      explanation = isCorrect
        ? "Perfect dictation!"
        : "Not quite what was said.";
    } else {
      // For multiple choice
      isCorrect = userAnswer === currentExercise.correctAnswer;
      explanation = isCorrect ? "Correct answer!" : "That's not quite right.";
    }

    // Play sound effect based on correct/incorrect answer
    const audioElement = new Audio();
    audioElement.src = isCorrect
      ? "/sounds/correct-answer.mp3"
      : "/sounds/incorrect-answer.mp3";
    audioElement.volume = 0.5;

    try {
      audioElement
        .play()
        .catch((e) => console.log("Audio playback prevented:", e));
    } catch (error) {
      console.log("Audio playback error:", error);
    }

    // Update score if answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }

    // Show feedback with enhanced SweetAlert
    if (isCorrect) {
      const randomSuccessMessages = [
        "Excellent work!",
        "Perfect!",
        "That's right!",
        "Brilliant!",
        "Great job!",
        "Fantastic!",
        "Correct!",
        "Amazing!",
      ];

      const randomMessage =
        randomSuccessMessages[
          Math.floor(Math.random() * randomSuccessMessages.length)
        ];

      showSuccessAlert({
        title: randomMessage,
        text: explanation,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          container: "xlingo-swal-container correct-alert",
          popup: "xlingo-swal-popup",
          title: "xlingo-swal-title",
          confirmButton: "xlingo-swal-confirm-button",
        },
        didOpen: (toast) => {
          // Add animation to the toast
          toast.style.animation = "pulseSuccess 0.5s ease";
        },
      });
    } else {
      const randomErrorMessages = [
        "Not quite right",
        "Try again",
        "Almost there",
        "Keep practicing",
        "Nice try",
      ];

      const randomMessage =
        randomErrorMessages[
          Math.floor(Math.random() * randomErrorMessages.length)
        ];
      let correctAnswerText = "";

      // Format the correct answer text based on exercise type
      if (
        currentExercise.type === "multipleChoice" &&
        currentExercise.options &&
        currentExercise.correctAnswer !== undefined
      ) {
        correctAnswerText = `The correct answer is: "${
          currentExercise.options[currentExercise.correctAnswer]
        }"`;
      } else if (currentExercise.type === "dictation") {
        correctAnswerText = `The correct answer is: "${currentExercise.correctAnswer}"`;
      }

      showErrorAlert({
        title: randomMessage,
        html: `<p>${explanation}</p>${
          correctAnswerText
            ? `<p class="correct-answer-text">${correctAnswerText}</p>`
            : ""
        }`,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          container: "xlingo-swal-container incorrect-alert",
          popup: "xlingo-swal-popup",
          title: "xlingo-swal-title",
          confirmButton: "xlingo-swal-confirm-button",
        },
        didOpen: (toast) => {
          // Add animation to the toast
          toast.style.animation = "pulseError 0.5s ease";
        },
      });
    }

    // Set a timeout to move to next step or show results after feedback
    const nextStepTimeout = setTimeout(
      () => {
        // Move to next step or show results
        if (currentStep < exerciseData.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setShowResults(true);
          setIsExerciseComplete(true);
        }
      },
      isCorrect ? 1600 : 2600
    );

    // Store timeout to clear on component unmount
    setAlertTimeout(nextStepTimeout);
  };

  // Helper: Get indices of graded exercises (exclude tools, reading, interactive_conversation)
  const getGradedExerciseIndices = () =>
    exerciseData
      .map((ex, idx) =>
        [
          "multipleChoice",
          "dialog",
          "roleplay",
          "listening",
          "fillBlank",
          "matching",
          "arrangement",
          "dictation",
          "comprehension",
        ].includes(ex.type)
          ? idx
          : null
      )
      .filter((idx) => idx !== null);

  // Helper: Calculate score based on graded exercises only
  const calculateScore = () => {
    const gradedIndices = getGradedExerciseIndices();
    let correct = 0;
    gradedIndices.forEach((idx) => {
      const ex = exerciseData[idx];
      const ans = answers[idx];
      if (ex && ans !== null && ans !== undefined) {
        if (Array.isArray(ex.correctAnswer)) {
          if (Array.isArray(ans)) {
            if (ex.type === "arrangement") {
              if (
                ans.length === ex.correctAnswer.length &&
                ans.every((val, i) => val === ex.correctAnswer[i])
              )
                correct++;
            } else if (ex.type === "matching") {
              let isCorrect = true;
              for (let i = 0; i < ex.options.length; i++) {
                const option = ex.options[i];
                const matchIndex = ans.indexOf(option.id);
                if (matchIndex === -1 || matchIndex !== i) {
                  isCorrect = false;
                  break;
                }
              }
              if (isCorrect) correct++;
            } else {
              if (
                ans.length === ex.correctAnswer.length &&
                ans.every(
                  (val, i) =>
                    val.toLowerCase() === ex.correctAnswer[i].toLowerCase()
                )
              )
                correct++;
            }
          }
        } else if (ex.type === "dictation") {
          if (
            typeof ans === "string" &&
            ans.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim()
          )
            correct++;
        } else {
          if (ans === ex.correctAnswer) correct++;
        }
      }
    });
    return correct;
  };

  // Helper: Get total number of graded exercises
  const getGradedExerciseCount = () => getGradedExerciseIndices().length;

  // Handle completion of lesson
  const handleCompletion = () => {
    const gradedCount = getGradedExerciseCount();
    const correctCount = calculateScore();
    const finalScore =
      gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : 0;
    // Update lesson status in localStorage (in a real app, this would be sent to the server)
    if (finalScore >= 70) {
      // Mark lesson as completed if score is 70% or higher
      // In a real app, this would call an API to update the user's progress
      console.log(`Lesson ${lessonId} completed with score: ${finalScore}%`);
      // Show congratulations alert before navigating
      showSuccessAlert(
        "Lesson Completed!",
        `You've earned ${lesson.xpReward} XP with a score of ${finalScore}%`
      );
      setTimeout(() => {
        navigate("/lessons-adventure");
      }, 2000);
    } else {
      // For lower scores, show different message
      showAlert({
        title: "Almost there!",
        text: `You got ${finalScore}%. Keep practicing to master this lesson!`,
        icon: "info",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setTimeout(() => {
        navigate("/lessons-adventure");
      }, 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="lesson-practice loading">
        <div className="loading-spinner"></div>
        <p>Generating lesson content...</p>
      </div>
    );
  }

  if (error && exerciseData.length === 0) {
    return (
      <div className="lesson-practice error">
        <p>{error}</p>
        <button onClick={() => navigate("/lessons-adventure")}>
          Return to Lessons
        </button>
      </div>
    );
  }

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

      case "interactive_conversation":
        return (
          <div className="exercise interactive-conversation">
            <div className="conversation-scenarios">
              <h4>Choose a scenario:</h4>
              <div className="scenario-buttons">
                {exercise.scenarios.map((scenario, index) => (
                  <button
                    key={index}
                    className={`scenario-button ${
                      activeConversationScenario?.name === scenario.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleScenarioChange(scenario)}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>

              {activeConversationScenario && (
                <p className="scenario-description">
                  {activeConversationScenario.description}
                </p>
              )}
            </div>

            <div className="conversation-area">
              <div className="conversation-history">
                {conversationHistory.length === 0 ? (
                  <div className="empty-conversation">
                    <p>
                      No messages yet. Start the conversation by sending a
                      message below.
                    </p>
                  </div>
                ) : (
                  conversationHistory.map((entry, index) => (
                    <div
                      key={index}
                      className={`conversation-message ${
                        entry.role === "user" ? "user-message" : "ai-message"
                      }`}
                    >
                      <div className="message-content">{entry.message}</div>
                      {entry.correction && (
                        <div className="message-correction">
                          <span className="correction-label">Correction:</span>{" "}
                          {entry.correction}
                        </div>
                      )}
                      {entry.suggestion && (
                        <div className="message-suggestion">
                          <span className="suggestion-label">Suggestion:</span>{" "}
                          {entry.suggestion}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="conversation-input">
                <input
                  type="text"
                  value={userMessage}
                  onChange={handleConversationInput}
                  placeholder={`Type a message in ${
                    lesson?.language || "Spanish"
                  }...`}
                  disabled={isSendingMessage}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !userMessage.trim()}
                >
                  {isSendingMessage ? "..." : "Send"}
                </button>
              </div>

              <div className="conversation-tips">
                <h4>Conversation Tips:</h4>
                <ul>
                  {learningTips.slice(0, 2).map((tip, index) => (
                    <li key={index}>
                      {tip.title}: {tip.description.substring(0, 100)}...
                    </li>
                  ))}
                  <li>
                    Try to respond in complete sentences for better practice
                  </li>
                  <li>
                    The AI will provide gentle corrections to help you improve
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "tools":
        return (
          <div className="exercise tools-panel">
            <h3>Language Learning Tools</h3>
            <p>Use these tools to enhance your language learning experience:</p>

            <div className="tools-buttons">
              {exercise.tools.map((tool, index) => (
                <button
                  key={index}
                  className="tool-button"
                  onClick={() => handleToolSelect(tool.id)}
                >
                  {tool.id === "translator" ? "🔤" : "📝"} {tool.name}
                  <span className="tool-description">{tool.description}</span>
                </button>
              ))}
            </div>

            {showTranslationPanel && (
              <div className="translation-panel">
                <h4>Translator</h4>
                <p>
                  Translate text between English and{" "}
                  {lesson?.language || "Spanish"}
                </p>

                <div className="translation-input-area">
                  <textarea
                    value={translationInput}
                    onChange={(e) => setTranslationInput(e.target.value)}
                    placeholder={`Type something in English to translate to ${
                      lesson?.language || "Spanish"
                    }...`}
                    rows={4}
                  ></textarea>

                  <button
                    className="translate-button"
                    onClick={handleTranslate}
                    disabled={!translationInput.trim()}
                  >
                    Translate
                  </button>
                </div>

                {translationResult && (
                  <div className="translation-result">
                    {translationResult.error ? (
                      <div className="translation-error">
                        {translationResult.error}
                      </div>
                    ) : (
                      <>
                        <div className="translation-text">
                          <h5>Translation:</h5>
                          <p>{translationResult.translation}</p>
                        </div>

                        {translationResult.explanations && (
                          <div className="translation-explanations">
                            <h5>Explanations:</h5>
                            <p>{translationResult.explanations}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {showGrammarPanel && (
              <div className="grammar-panel">
                <h4>Grammar Check</h4>
                <p>Check your writing in {lesson?.language || "Spanish"}</p>

                <div className="grammar-input-area">
                  <textarea
                    value={grammarInput}
                    onChange={(e) => setGrammarInput(e.target.value)}
                    placeholder={`Type something in ${
                      lesson?.language || "Spanish"
                    } to check grammar...`}
                    rows={4}
                  ></textarea>

                  <button
                    className="check-grammar-button"
                    onClick={handleGrammarCheck}
                    disabled={!grammarInput.trim()}
                  >
                    Check Grammar
                  </button>
                </div>

                {grammarResult && (
                  <div className="grammar-result">
                    {grammarResult.error ? (
                      <div className="grammar-error">{grammarResult.error}</div>
                    ) : (
                      <>
                        <div className="corrected-text">
                          <h5>Corrected Text:</h5>
                          <p>{grammarResult.correctedText}</p>
                        </div>

                        {grammarResult.corrections &&
                          grammarResult.corrections.length > 0 && (
                            <div className="corrections-list">
                              <h5>Corrections:</h5>
                              <ul>
                                {grammarResult.corrections.map(
                                  (correction, index) => (
                                    <li key={index}>
                                      <span className="original-text">
                                        {correction.original}
                                      </span>
                                      <span className="arrow">→</span>
                                      <span className="correction-text">
                                        {correction.correction}
                                      </span>
                                      <div className="explanation">
                                        {correction.explanation}
                                      </div>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {grammarResult.generalFeedback && (
                          <div className="general-feedback">
                            <h5>General Feedback:</h5>
                            <p>{grammarResult.generalFeedback}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
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

  // Determine if we should show the "Next" button instead of "Check & Continue"
  // for non-standard exercises that don't need checking
  const isNonStandardExercise =
    exerciseData[currentStep]?.type === "interactive_conversation" ||
    exerciseData[currentStep]?.type === "tools";

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
                      (calculateScore() / getGradedExerciseCount()) * 283
                    )} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="score-percentage">
                  {getGradedExerciseCount() > 0
                    ? Math.round(
                        (calculateScore() / getGradedExerciseCount()) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <p>
                You got {calculateScore()} out of {getGradedExerciseCount()}{" "}
                correct!
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
                  setConversationHistory([]);
                  setTranslationInput("");
                  setTranslationResult(null);
                  setGrammarInput("");
                  setGrammarResult(null);
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
                  isNonStandardExercise || answers[currentStep] !== null
                    ? "active"
                    : "disabled"
                }`}
                onClick={checkAnswer}
                disabled={
                  !isNonStandardExercise && answers[currentStep] === null
                }
              >
                {isNonStandardExercise
                  ? currentStep < exerciseData.length - 1
                    ? "Next"
                    : "Finish"
                  : currentStep < exerciseData.length - 1
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
