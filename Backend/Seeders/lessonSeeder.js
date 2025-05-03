const mongoose = require("mongoose");
const Lesson = require("../Models/Lesson");
const connectDB = require("../Configurations/database");

// Sample lesson data for different languages and types
const lessonData = [
  // Spanish Vocabulary Lessons
  {
    title: "Spanish Basics: Greetings",
    description: "Learn common Spanish greetings and introductions",
    language: "spanish",
    type: "vocabulary",
    difficulty: 1,
    xpReward: 20,
    content: {
      vocabulary: [
        { word: "Hola", translation: "Hello" },
        { word: "Buenos días", translation: "Good morning" },
        { word: "Buenas tardes", translation: "Good afternoon" },
        { word: "Buenas noches", translation: "Good evening/night" },
        { word: "¿Cómo estás?", translation: "How are you?" },
        { word: "Bien, gracias", translation: "Fine, thank you" },
        { word: "¿Cómo te llamas?", translation: "What's your name?" },
        { word: "Me llamo...", translation: "My name is..." },
        { word: "Mucho gusto", translation: "Nice to meet you" },
        { word: "Adiós", translation: "Goodbye" }
      ],
      exercises: [
        {
          type: "match",
          prompt: "Match the Spanish greeting with its English translation",
          pairs: [
            { left: "Hola", right: "Hello" },
            { left: "Buenas tardes", right: "Good afternoon" },
            { left: "¿Cómo estás?", right: "How are you?" }
          ]
        },
        {
          type: "multipleChoice",
          prompt: "How do you say 'Good morning' in Spanish?",
          options: ["Buenos días", "Buenas tardes", "Buenas noches", "Adiós"],
          correctAnswer: "Buenos días"
        }
      ]
    },
    order: 1,
    estimatedTime: 15,
    isActive: true
  },
  {
    title: "Spanish Basics: Numbers 1-20",
    description: "Learn to count from 1 to 20 in Spanish",
    language: "spanish",
    type: "vocabulary",
    difficulty: 1,
    xpReward: 25,
    content: {
      vocabulary: [
        { word: "uno", translation: "one" },
        { word: "dos", translation: "two" },
        { word: "tres", translation: "three" },
        { word: "cuatro", translation: "four" },
        { word: "cinco", translation: "five" },
        { word: "seis", translation: "six" },
        { word: "siete", translation: "seven" },
        { word: "ocho", translation: "eight" },
        { word: "nueve", translation: "nine" },
        { word: "diez", translation: "ten" },
        { word: "once", translation: "eleven" },
        { word: "doce", translation: "twelve" },
        { word: "trece", translation: "thirteen" },
        { word: "catorce", translation: "fourteen" },
        { word: "quince", translation: "fifteen" },
        { word: "dieciséis", translation: "sixteen" },
        { word: "diecisiete", translation: "seventeen" },
        { word: "dieciocho", translation: "eighteen" },
        { word: "diecinueve", translation: "nineteen" },
        { word: "veinte", translation: "twenty" }
      ],
      exercises: [
        {
          type: "fillBlank",
          prompt: "Fill in the missing Spanish numbers",
          sentences: [
            { text: "uno, _____, tres", answer: "dos" },
            { text: "cinco, seis, _____, ocho", answer: "siete" },
            { text: "_____, diecisiete, dieciocho", answer: "dieciséis" }
          ]
        },
        {
          type: "multipleChoice",
          prompt: "What is 'fifteen' in Spanish?",
          options: ["catorce", "quince", "dieciséis", "diez"],
          correctAnswer: "quince"
        }
      ]
    },
    prerequisites: [],
    order: 2,
    estimatedTime: 20,
    isActive: true
  },
  
  // French Grammar Lessons
  {
    title: "French Present Tense",
    description: "Learn how to conjugate regular verbs in the present tense",
    language: "french",
    type: "grammar",
    difficulty: 2,
    xpReward: 30,
    content: {
      explanation: "In French, regular verbs are conjugated according to their ending (-er, -ir, -re).",
      examples: [
        { verb: "Parler (to speak)", conjugation: "je parle, tu parles, il/elle parle, nous parlons, vous parlez, ils/elles parlent" },
        { verb: "Finir (to finish)", conjugation: "je finis, tu finis, il/elle finit, nous finissons, vous finissez, ils/elles finissent" },
        { verb: "Vendre (to sell)", conjugation: "je vends, tu vends, il/elle vend, nous vendons, vous vendez, ils/elles vendent" }
      ],
      exercises: [
        {
          type: "fillBlank",
          prompt: "Complete the conjugation",
          sentences: [
            { text: "Tu _____ au cinéma. (parler)", answer: "parles" },
            { text: "Nous _____ nos devoirs. (finir)", answer: "finissons" },
            { text: "Ils _____ des fruits. (vendre)", answer: "vendent" }
          ]
        }
      ]
    },
    prerequisites: [],
    order: 1,
    estimatedTime: 25,
    isActive: true
  },
  
  // German Pronunciation Lesson
  {
    title: "German Pronunciation: Umlauts",
    description: "Learn how to pronounce German umlauts: ä, ö, ü",
    language: "german",
    type: "pronunciation",
    difficulty: 2,
    xpReward: 25,
    content: {
      rules: [
        { rule: "ä - pronounced like the 'e' in 'bed'" },
        { rule: "ö - round your lips as if to say 'o' but say 'e'" },
        { rule: "ü - round your lips as if to say 'u' but say 'ee'" }
      ],
      examples: [
        { word: "Äpfel", pronunciation: "Eh-pfel", meaning: "apples" },
        { word: "schön", pronunciation: "shurn", meaning: "beautiful" },
        { word: "über", pronunciation: "oo-ber", meaning: "over/above" }
      ],
      exercises: [
        {
          type: "pronunciation",
          words: ["Mädchen", "hören", "Tür", "Käse", "Österreich", "fünf"]
        }
      ]
    },
    prerequisites: [],
    order: 1,
    estimatedTime: 20,
    isActive: true
  },
  
  // Japanese Conversation Lesson
  {
    title: "Japanese Basic Conversation",
    description: "Practice basic Japanese conversation patterns",
    language: "japanese",
    type: "conversation",
    difficulty: 3,
    xpReward: 35,
    content: {
      dialogues: [
        {
          title: "Meeting Someone",
          exchanges: [
            { speaker: "A", text: "こんにちは。", translation: "Hello." },
            { speaker: "B", text: "こんにちは。お元気ですか？", translation: "Hello. How are you?" },
            { speaker: "A", text: "はい、元気です。あなたは？", translation: "Yes, I'm fine. And you?" },
            { speaker: "B", text: "私も元気です。", translation: "I'm fine too." }
          ]
        },
        {
          title: "Introducing Yourself",
          exchanges: [
            { speaker: "A", text: "はじめまして。私の名前は田中です。", translation: "Nice to meet you. My name is Tanaka." },
            { speaker: "B", text: "はじめまして。私はスミスです。", translation: "Nice to meet you. I'm Smith." },
            { speaker: "A", text: "どうぞよろしくお願いします。", translation: "Please treat me well (standard greeting)." },
            { speaker: "B", text: "こちらこそ、よろしくお願いします。", translation: "Likewise, please treat me well." }
          ]
        }
      ],
      exercises: [
        {
          type: "rolePlay",
          prompt: "Practice introducing yourself in Japanese"
        }
      ]
    },
    prerequisites: [],
    order: 1,
    estimatedTime: 30,
    isActive: true
  }
];

// Function to seed lessons
const seedLessons = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Delete existing lessons
    await Lesson.deleteMany({});
    console.log("Deleted existing lessons");
    
    // Insert new lessons
    const createdLessons = await Lesson.insertMany(lessonData);
    console.log(`Added ${createdLessons.length} lessons`);
    
    console.log("Lesson seeding completed successfully");
    
    // Add prerequisites (now that we have IDs)
    // For example, making Spanish Numbers lesson require Spanish Greetings completion
    if (createdLessons.length >= 2) {
      const spanishGreetings = createdLessons[0];
      const spanishNumbers = createdLessons[1];
      
      await Lesson.findByIdAndUpdate(spanishNumbers._id, {
        prerequisites: [spanishGreetings._id]
      });
      
      console.log("Updated lesson prerequisites");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding lessons:", error);
    process.exit(1);
  }
};

// Run the seeder
seedLessons();