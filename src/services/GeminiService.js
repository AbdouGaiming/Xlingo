import { GoogleGenerativeAI } from "@google/generative-ai";
import config, { ApiKeyManager } from "./geminiConfig";

// Initialize the Gemini API with the API key from our central manager
const genAI = new GoogleGenerativeAI(config.API_KEY);

// Main model for content generation
const model = genAI.getGenerativeModel({ 
  model: config.models.default,
  generationConfig: config.defaultParams
});

// Chat model for conversation practice
const chatModel = genAI.getGenerativeModel({
  model: config.models.chat,
  generationConfig: {
    ...config.defaultParams,
    temperature: 0.8, // Slightly more creative for conversations
  }
});

/**
 * Generate lesson content based on language, level, and topic
 * @param {string} language - Target language (e.g., "Spanish", "French")
 * @param {string} level - Proficiency level (e.g., "Beginner", "Intermediate", "Advanced")
 * @param {string} topic - Lesson topic or theme
 * @returns {Promise<object>} - Generated lesson content
 */
export const generateLesson = async (language, level, topic) => {
  try {
    // Check if we have a cached response for this query
    const cacheKey = `lesson_${language}_${level}_${topic}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    
    if (cachedResponse) {
      console.log("Using cached lesson data");
      return JSON.parse(cachedResponse);
    }
    
    const prompt = `
      Create a language learning lesson for ${language} at ${level} level about "${topic}".
      Structure the response as a JSON object with the following format:
      {
        "title": "Lesson title",
        "introduction": "Brief introduction to the topic",
        "vocabulary": [
          {"word": "word1", "translation": "translation1", "example": "example sentence"},
          {"word": "word2", "translation": "translation2", "example": "example sentence"}
        ],
        "grammar": {
          "rule": "Grammar rule explanation",
          "examples": ["example1", "example2"]
        },
        "exercises": [
          {
            "type": "multiple-choice",
            "question": "Question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": "correctOption"
          },
          {
            "type": "fill-in-blank",
            "sentence": "Sentence with _____ to fill",
            "correctAnswer": "answer"
          }
        ],
        "conversationPractice": [
          {"role": "speaker1", "text": "Text in target language"},
          {"role": "speaker2", "text": "Response in target language"}
        ]
      }
    `;

    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response text (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      const parsedData = JSON.parse(jsonString);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(parsedData));
      
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse lesson JSON:", parseError);
      
      // Fallback to mock data if parsing fails
      const mockLessonData = generateMockLesson(language, level, topic);
      return mockLessonData;
    }
  } catch (error) {
    console.error("Error generating lesson:", error);
    
    // Fallback to mock data if API call fails
    const mockLessonData = generateMockLesson(language, level, topic);
    return mockLessonData;
  }
};

/**
 * Generate vocabulary flashcards for a specific language and topic
 * @param {string} language - Target language
 * @param {string} topic - Vocabulary topic
 * @param {number} count - Number of vocabulary items to generate
 * @returns {Promise<Array>} - Generated vocabulary items
 */
export const generateVocabulary = async (language, topic, count = 10) => {
  try {
    // Check if we have a cached response for this query
    const cacheKey = `vocab_${language}_${topic}_${count}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    
    if (cachedResponse) {
      console.log("Using cached vocabulary data");
      return JSON.parse(cachedResponse);
    }
    
    const prompt = `
      Generate ${count} vocabulary words in ${language} related to "${topic}".
      Return the result as a JSON array with the following format:
      [
        {
          "word": "Word in ${language}",
          "translation": "English translation",
          "pronunciation": "Simplified pronunciation guide",
          "example": "Example sentence using the word"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      const parsedData = JSON.parse(jsonString);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(parsedData));
      
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse vocabulary JSON:", parseError);
      
      // Fallback to mock data
      return generateMockVocabulary(language, topic, count);
    }
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    
    // Fallback to mock data
    return generateMockVocabulary(language, topic, count);
  }
};

/**
 * Generate pronunciation exercises for a language
 * @param {string} language - Target language
 * @param {string} level - Proficiency level
 * @returns {Promise<Array>} - Generated pronunciation exercises
 */
export const generatePronunciationExercises = async (language, level) => {
  try {
    // Check if we have a cached response for this query
    const cacheKey = `pronunciation_${language}_${level}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    
    if (cachedResponse) {
      console.log("Using cached pronunciation data");
      return JSON.parse(cachedResponse);
    }
    
    const prompt = `
      Create 5 pronunciation exercises for ${language} learners at ${level} level.
      Focus on common pronunciation challenges for English speakers learning ${language}.
      Structure the response as a JSON array with the following format:
      [
        {
          "sound": "The specific sound or phoneme to practice",
          "explanation": "Brief explanation of how to make this sound",
          "examples": ["example1", "example2", "example3"],
          "practicePhrase": "A phrase to practice the sound"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      const parsedData = JSON.parse(jsonString);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(parsedData));
      
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse pronunciation exercises JSON:", parseError);
      
      // Fallback to mock data
      return generateMockPronunciationExercises(language, level);
    }
  } catch (error) {
    console.error("Error generating pronunciation exercises:", error);
    
    // Fallback to mock data
    return generateMockPronunciationExercises(language, level);
  }
};

/**
 * Generate an interactive language conversation with feedback
 * @param {string} language - Target language
 * @param {string} level - Proficiency level (Beginner, Intermediate, Advanced)
 * @param {string} scenario - Conversation scenario (e.g., "At a restaurant", "Asking for directions")
 * @param {string} userMessage - The user's message in the target language
 * @returns {Promise<object>} - Response with next dialogue and feedback
 */
export const practiceConversation = async (language, level, scenario, userMessage) => {
  try {
    // Create a chat history for context
    const chat = chatModel.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `I want to practice a conversation in ${language} at ${level} level. The scenario is: ${scenario}. You will play the role of a native speaker. Please keep your responses appropriate for my ${level} level, and provide gentle corrections to my grammar or vocabulary when needed. Let's start the conversation.`
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text: `Great! I'll help you practice ${language} in a ${scenario} scenario. I'll keep my responses suitable for your ${level} level and provide gentle corrections when needed. Let's begin!`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    // Add user message to chat
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const responseText = response.text();
    
    // Process and structure the response
    try {
      // Parse the response into components: reply, correction, suggestion
      let reply = responseText;
      let correction = null;
      let suggestion = null;
      
      // Check for correction section (often marked with asterisks or in parentheses)
      const correctionMatch = responseText.match(/\*\*Correction:\*\*\s*(.*?)(?=\s*\n\n|\s*$)/s) || 
                               responseText.match(/\(Correction:\s*(.*?)\)/s);
      
      if (correctionMatch) {
        correction = correctionMatch[1].trim();
        // Remove the correction part from the main reply
        reply = responseText.replace(correctionMatch[0], '').trim();
      }
      
      // Check for suggestion section
      const suggestionMatch = responseText.match(/\*\*Suggestion:\*\*\s*(.*?)(?=\s*\n\n|\s*$)/s) ||
                               responseText.match(/\(Suggestion:\s*(.*?)\)/s);
      
      if (suggestionMatch) {
        suggestion = suggestionMatch[1].trim();
        // Remove the suggestion part from the main reply
        reply = reply.replace(suggestionMatch[0], '').trim();
      }
      
      // Return structured response
      return {
        reply: reply,
        correction: correction,
        suggestion: suggestion,
        fullResponse: responseText
      };
    } catch (parseError) {
      console.error("Failed to parse conversation response:", parseError);
      // Return the full response if parsing fails
      return {
        reply: responseText,
        correction: null,
        suggestion: null,
        fullResponse: responseText
      };
    }
  } catch (error) {
    console.error("Error in conversation practice:", error);
    return {
      reply: "I'm sorry, I couldn't process your message right now. Let's try again later.",
      correction: null,
      suggestion: null,
      error: error.message
    };
  }
};

/**
 * Translate text between languages
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language (e.g., "English", "Spanish")
 * @param {string} targetLanguage - Target language
 * @param {boolean} includeExplanation - Whether to include grammar/usage explanations
 * @returns {Promise<object>} - Translation with optional explanations
 */
export const translateText = async (text, sourceLanguage, targetLanguage, includeExplanation = false) => {
  try {
    // Check if we have a cached response for this query
    const cacheKey = `translation_${sourceLanguage}_${targetLanguage}_${text.substring(0, 50)}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    
    if (cachedResponse) {
      console.log("Using cached translation data");
      return JSON.parse(cachedResponse);
    }
    
    const prompt = `
      Translate the following text from ${sourceLanguage} to ${targetLanguage}:
      "${text}"
      
      ${includeExplanation ? `Also provide brief explanations about any interesting grammar, idioms, or cultural context in the translation.` : ''}
      
      Format your response as:
      Translation: [translation here]
      ${includeExplanation ? 'Explanations: [explanations here]' : ''}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the response
    try {
      // Extract translation
      const translationMatch = responseText.match(/Translation:\s*(.*?)(?=\s*\n\n|Explanations:|$)/s);
      const translation = translationMatch ? translationMatch[1].trim() : responseText;
      
      // Extract explanations if requested
      let explanations = null;
      if (includeExplanation) {
        const explanationsMatch = responseText.match(/Explanations:\s*(.*?)(?=\s*$)/s);
        explanations = explanationsMatch ? explanationsMatch[1].trim() : null;
      }
      
      const result = {
        translation,
        explanations,
        sourceLanguage,
        targetLanguage,
        originalText: text
      };
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(result));
      
      return result;
    } catch (parseError) {
      console.error("Failed to parse translation:", parseError);
      
      // Return basic translation without structure if parsing fails
      return {
        translation: responseText,
        explanations: null,
        sourceLanguage,
        targetLanguage,
        originalText: text
      };
    }
  } catch (error) {
    console.error("Error in translation:", error);
    return {
      translation: null,
      explanations: null,
      sourceLanguage,
      targetLanguage,
      originalText: text,
      error: error.message
    };
  }
};

/**
 * Check and correct grammar in the target language
 * @param {string} text - Text to check 
 * @param {string} language - Language of the text
 * @param {string} level - User's proficiency level
 * @returns {Promise<object>} - Corrections with explanations
 */
export const correctGrammar = async (text, language, level) => {
  try {
    const prompt = `
      As a language teacher, check the following ${language} text for grammar, spelling, and usage errors.
      The text was written by a ${level} level student.
      
      "${text}"
      
      Provide corrections and explanations that would be helpful for a ${level} level student.
      Format your response as a JSON object with the following structure:
      {
        "correctedText": "The fully corrected text",
        "corrections": [
          {
            "original": "original phrase with error",
            "correction": "corrected phrase",
            "explanation": "explanation of the error and correction suitable for a ${level} level student"
          }
        ],
        "generalFeedback": "Overall feedback on the text"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response text (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      const parsedData = JSON.parse(jsonString);
      
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse grammar correction JSON:", parseError);
      
      // Return a basic structure with the full response if parsing fails
      return {
        correctedText: text,
        corrections: [],
        generalFeedback: "Error parsing response. Please try again with different text."
      };
    }
  } catch (error) {
    console.error("Error correcting grammar:", error);
    return {
      correctedText: text,
      corrections: [],
      generalFeedback: "An error occurred. Please try again later.",
      error: error.message
    };
  }
};

/**
 * Generate language learning tips specific to language and level
 * @param {string} language - Target language 
 * @param {string} level - User's proficiency level
 * @param {string} specificArea - Specific area of focus (optional)
 * @returns {Promise<Array>} - Array of learning tips
 */
export const getLearningTips = async (language, level, specificArea = null) => {
  try {
    const cacheKey = `tips_${language}_${level}_${specificArea || 'general'}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    
    if (cachedResponse) {
      console.log("Using cached learning tips");
      return JSON.parse(cachedResponse);
    }
    
    const areaPrompt = specificArea 
      ? `focusing on ${specificArea}` 
      : `for general language acquisition`;
    
    const prompt = `
      Provide 5 effective language learning tips for ${level} level students of ${language} ${areaPrompt}.
      Each tip should be practical, specific to ${language}, and immediately actionable.
      
      Format your response as a JSON array of tip objects with the following structure:
      [
        {
          "title": "Short tip title",
          "description": "Detailed explanation of the tip",
          "example": "An example demonstrating the tip in action",
          "difficulty": "easy|medium|hard"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      const parsedData = JSON.parse(jsonString);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(parsedData));
      
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse learning tips JSON:", parseError);
      
      // Return generic tips if parsing fails
      return generateGenericTips(language, level);
    }
  } catch (error) {
    console.error("Error generating learning tips:", error);
    return generateGenericTips(language, level);
  }
};

/**
 * Generate generic language learning tips as a fallback
 */
function generateGenericTips(language, level) {
  return [
    {
      title: "Daily Practice",
      description: `Consistency is key in language learning. Spend at least 15-20 minutes every day practicing ${language}.`,
      example: "Use a language learning app during your daily commute or coffee break.",
      difficulty: "easy"
    },
    {
      title: "Immersive Listening",
      description: `Listen to ${language} music, podcasts, or watch shows with subtitles to train your ear.`,
      example: `Find a ${language} playlist on Spotify or a beginner-friendly YouTube channel.`,
      difficulty: "medium"
    },
    {
      title: "Speak From Day One",
      description: "Don't wait until you feel 'ready' to speak. Practice speaking from the beginning.",
      example: "Record yourself speaking or find a language exchange partner online.",
      difficulty: "medium"
    },
    {
      title: "Use Spaced Repetition",
      description: "Review vocabulary at increasing intervals to optimize memorization.",
      example: "Use flashcard apps like Anki that implement spaced repetition algorithms.",
      difficulty: "easy"
    },
    {
      title: "Focus on High-Frequency Words",
      description: `Learn the most common 500-1000 words in ${language} first to understand up to 80% of everyday conversations.`,
      example: `Search for "${language} frequency dictionary" or "most common ${language} words".`,
      difficulty: "easy"
    }
  ];
}

// Mock data generators for fallback content
function generateMockLesson(language, level, topic) {
  // Create mock lesson data based on the requested language, level, and topic
  const languageMap = {
    "Spanish": { hello: "Hola", goodbye: "Adiós", please: "Por favor", thanks: "Gracias" },
    "French": { hello: "Bonjour", goodbye: "Au revoir", please: "S'il vous plaît", thanks: "Merci" },
    "German": { hello: "Hallo", goodbye: "Auf Wiedersehen", please: "Bitte", thanks: "Danke" },
    "Italian": { hello: "Ciao", goodbye: "Arrivederci", please: "Per favore", thanks: "Grazie" }
  };
  
  const targetLanguage = languageMap[language] || languageMap["Spanish"];
  
  return {
    "title": `${level} ${language}: ${topic}`,
    "introduction": `Welcome to this ${level} lesson about ${topic} in ${language}.`,
    "vocabulary": [
      {"word": targetLanguage.hello, "translation": "Hello", "example": `${targetLanguage.hello}, ¿cómo estás?`},
      {"word": targetLanguage.goodbye, "translation": "Goodbye", "example": `${targetLanguage.goodbye}, hasta mañana.`},
      {"word": targetLanguage.please, "translation": "Please", "example": `${targetLanguage.please}, ayúdame.`},
      {"word": targetLanguage.thanks, "translation": "Thank you", "example": `${targetLanguage.thanks} por tu ayuda.`}
    ],
    "grammar": {
      "rule": "Basic sentence structure in " + language,
      "examples": ["Example 1", "Example 2"]
    },
    "exercises": [
      {
        "type": "multiple-choice",
        "question": `How do you say "Hello" in ${language}?`,
        "options": ["Hello", targetLanguage.hello, "Ciao", "Namaste"],
        "correctAnswer": targetLanguage.hello
      },
      {
        "type": "fill-in-blank",
        "sentence": `To thank someone in ${language}, say "_____".`,
        "correctAnswer": targetLanguage.thanks
      }
    ],
    "conversationPractice": [
      {"role": "speaker1", "text": targetLanguage.hello},
      {"role": "speaker2", "text": targetLanguage.hello + ", " + targetLanguage.thanks}
    ]
  };
}

function generateMockVocabulary(language, topic, count) {
  const topics = {
    "Food": [
      { word: "el pan", translation: "bread", pronunciation: "el pahn", example: "Me gusta el pan fresco." },
      { word: "la manzana", translation: "apple", pronunciation: "lah mahn-ZAH-nah", example: "Como una manzana cada día." },
      { word: "el queso", translation: "cheese", pronunciation: "el KEH-so", example: "El queso va bien con el vino." },
      { word: "la leche", translation: "milk", pronunciation: "lah LEH-cheh", example: "Bebo leche con el desayuno." },
      { word: "el agua", translation: "water", pronunciation: "el AH-gwah", example: "Bebo mucha agua cada día." }
    ],
    "Travel": [
      { word: "el hotel", translation: "hotel", pronunciation: "el oh-TEL", example: "Me quedo en un hotel." },
      { word: "el aeropuerto", translation: "airport", pronunciation: "el ah-eh-roh-PWEHR-toh", example: "Llegamos al aeropuerto a tiempo." },
      { word: "el tren", translation: "train", pronunciation: "el trehn", example: "Viajo en tren a menudo." },
      { word: "el pasaporte", translation: "passport", pronunciation: "el pah-sah-POR-teh", example: "Necesito mi pasaporte para viajar." },
      { word: "la playa", translation: "beach", pronunciation: "lah PLAH-yah", example: "Vamos a la playa en verano." }
    ]
  };
  
  // Default to food topic if the requested topic isn't available
  let vocabList = topics["Food"];
  
  // Try to match the topic to our available topics
  const topicKey = Object.keys(topics).find(key => 
    topic.toLowerCase().includes(key.toLowerCase()));
  
  if (topicKey) {
    vocabList = topics[topicKey];
  }
  
  // Return the requested number of vocabulary items, or all if count > available items
  return vocabList.slice(0, Math.min(count, vocabList.length));
}

function generateMockPronunciationExercises(language, level) {
  // Mock pronunciation exercises for Spanish
  if (language.toLowerCase() === "spanish") {
    return [
      {
        "sound": "The Spanish 'r'",
        "explanation": "The Spanish 'r' is a tapped sound, made by quickly tapping the tongue against the roof of the mouth.",
        "examples": ["pero", "caro", "hora"],
        "practicePhrase": "El perro corre por la tierra roja."
      },
      {
        "sound": "The Spanish 'ñ'",
        "explanation": "The 'ñ' sound is similar to the 'ny' in 'canyon'.",
        "examples": ["año", "niño", "mañana"],
        "practicePhrase": "El niño cumple años mañana."
      },
      {
        "sound": "The Spanish 'j'",
        "explanation": "The Spanish 'j' is pronounced like an English 'h' but more guttural.",
        "examples": ["jamón", "jirafa", "ojo"],
        "practicePhrase": "Juan juega al ajedrez con José."
      }
    ];
  }
  
  // Mock pronunciation exercises for French
  if (language.toLowerCase() === "french") {
    return [
      {
        "sound": "French nasal vowels",
        "explanation": "French has nasal vowels where air passes through the nose and mouth.",
        "examples": ["bon", "vin", "blanc"],
        "practicePhrase": "Un bon vin blanc."
      },
      {
        "sound": "The French 'r'",
        "explanation": "The French 'r' is pronounced at the back of the throat.",
        "examples": ["rouge", "Paris", "merci"],
        "practicePhrase": "Je vais à Paris en avril."
      },
      {
        "sound": "French 'u' sound",
        "explanation": "The French 'u' is pronounced with rounded lips and the tongue raised toward the front of the mouth.",
        "examples": ["tu", "rue", "dur"],
        "practicePhrase": "Tu as vu la rue?"
      }
    ];
  }
  
  // Default pronunciation exercises for any language
  return [
    {
      "sound": "Basic vowels",
      "explanation": `Practice the basic vowel sounds in ${language}.`,
      "examples": ["a", "e", "i", "o", "u"],
      "practicePhrase": "Sample practice phrase for vowels."
    },
    {
      "sound": "Common consonants",
      "explanation": `Practice these common consonant sounds in ${language}.`,
      "examples": ["b", "d", "k", "l", "m"],
      "practicePhrase": "Sample practice phrase for consonants."
    },
    {
      "sound": "Challenging sounds",
      "explanation": `These sounds are often challenging for ${language} learners.`,
      "examples": ["Example 1", "Example 2", "Example 3"],
      "practicePhrase": "Sample challenge phrase."
    }
  ];
}

export const updateApiKey = (newKey) => {
  ApiKeyManager.setApiKey(newKey);
  // Force reload the page to reinitialize the API with the new key
  window.location.reload();
  return true;
};

export default {
  generateLesson,
  generateVocabulary,
  generatePronunciationExercises,
  practiceConversation,
  translateText,
  correctGrammar,
  getLearningTips,
  updateApiKey
};