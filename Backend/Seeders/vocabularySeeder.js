const mongoose = require("mongoose");
const Vocabulary = require("../Models/Vocabulary");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Database connection options
const options = {
  autoIndex: true,
};

/**
 * Connect to MongoDB database directly
 */
const connectToDatabase = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MongoDB connection string is not defined in environment variables"
      );
    }

    const connection = await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

const generateVocabularyItems = () => {
  return [
    // Spanish - Food category
    {
      word: "el pan",
      translation: "bread",
      languageId: "es",
      categoryId: "food",
      example: "Me gusta el pan fresco.",
      hint: "Something you eat with butter",
      difficulty: 1,
    },
    {
      word: "la manzana",
      translation: "apple",
      languageId: "es",
      categoryId: "food",
      example: "Como una manzana cada día.",
      hint: "A fruit that keeps the doctor away",
      difficulty: 1,
    },
    {
      word: "la leche",
      translation: "milk",
      languageId: "es",
      categoryId: "food",
      example: "Bebo leche con el desayuno.",
      hint: "White liquid from cows",
      difficulty: 1,
    },
    {
      word: "el queso",
      translation: "cheese",
      languageId: "es",
      categoryId: "food",
      example: "El queso va bien con el vino.",
      hint: "Dairy product, often yellow",
      difficulty: 2,
    },
    {
      word: "el agua",
      translation: "water",
      languageId: "es",
      categoryId: "food",
      example: "Bebo mucha agua cada día.",
      hint: "Essential liquid for life",
      difficulty: 1,
    },
    {
      word: "la carne",
      translation: "meat",
      languageId: "es",
      categoryId: "food",
      example: "No como mucha carne.",
      hint: "Protein from animals",
      difficulty: 1,
    },
    {
      word: "los huevos",
      translation: "eggs",
      languageId: "es",
      categoryId: "food",
      example: "Me gustan los huevos revueltos.",
      hint: "Come from chickens",
      difficulty: 1,
    },
    {
      word: "el arroz",
      translation: "rice",
      languageId: "es",
      categoryId: "food",
      example: "El arroz es un alimento básico.",
      hint: "Small white grains",
      difficulty: 1,
    },
    {
      word: "la sopa",
      translation: "soup",
      languageId: "es",
      categoryId: "food",
      example: "La sopa está caliente.",
      hint: "Liquid food typically served hot",
      difficulty: 1,
    },
    {
      word: "el pescado",
      translation: "fish",
      languageId: "es",
      categoryId: "food",
      example: "Me gusta comer pescado fresco.",
      hint: "Seafood that swims",
      difficulty: 2,
    },

    // Spanish - Travel category
    {
      word: "el hotel",
      translation: "hotel",
      languageId: "es",
      categoryId: "travel",
      example: "Me quedo en un hotel.",
      hint: "Where you stay when traveling",
      difficulty: 1,
    },
    {
      word: "el aeropuerto",
      translation: "airport",
      languageId: "es",
      categoryId: "travel",
      example: "Llegamos al aeropuerto a tiempo.",
      hint: "Where planes take off and land",
      difficulty: 2,
    },
    {
      word: "el tren",
      translation: "train",
      languageId: "es",
      categoryId: "travel",
      example: "Viajo en tren a menudo.",
      hint: "Moves on tracks",
      difficulty: 1,
    },
    {
      word: "el pasaporte",
      translation: "passport",
      languageId: "es",
      categoryId: "travel",
      example: "Necesito mi pasaporte para viajar.",
      hint: "Document for international travel",
      difficulty: 2,
    },
    {
      word: "la playa",
      translation: "beach",
      languageId: "es",
      categoryId: "travel",
      example: "Vamos a la playa en verano.",
      hint: "Sand and ocean",
      difficulty: 1,
    },
    {
      word: "el avión",
      translation: "airplane",
      languageId: "es",
      categoryId: "travel",
      example: "Voy a tomar un avión a Madrid.",
      hint: "Flying transportation",
      difficulty: 1,
    },
    {
      word: "la maleta",
      translation: "suitcase",
      languageId: "es",
      categoryId: "travel",
      example: "Preparo mi maleta para el viaje.",
      hint: "Container for clothes when traveling",
      difficulty: 1,
    },

    // Spanish - Basics category
    {
      word: "hola",
      translation: "hello",
      languageId: "es",
      categoryId: "basics",
      example: "Hola, ¿cómo estás?",
      hint: "A greeting",
      difficulty: 1,
    },
    {
      word: "adiós",
      translation: "goodbye",
      languageId: "es",
      categoryId: "basics",
      example: "Adiós, nos vemos mañana.",
      hint: "What you say when leaving",
      difficulty: 1,
    },
    {
      word: "gracias",
      translation: "thank you",
      languageId: "es",
      categoryId: "basics",
      example: "Muchas gracias por tu ayuda.",
      hint: "Express gratitude",
      difficulty: 1,
    },
    {
      word: "por favor",
      translation: "please",
      languageId: "es",
      categoryId: "basics",
      example: "Dame el libro, por favor.",
      hint: "Being polite when asking for something",
      difficulty: 1,
    },
    {
      word: "buenos días",
      translation: "good morning",
      languageId: "es",
      categoryId: "basics",
      example: "Buenos días, ¿cómo estás?",
      hint: "Morning greeting",
      difficulty: 1,
    },
    {
      word: "buenas noches",
      translation: "good night",
      languageId: "es",
      categoryId: "basics",
      example: "Buenas noches, hasta mañana.",
      hint: "What you say before sleeping",
      difficulty: 1,
    },

    // French - Basics category
    {
      word: "bonjour",
      translation: "hello",
      languageId: "fr",
      categoryId: "basics",
      example: "Bonjour, comment ça va?",
      hint: "Basic greeting",
      difficulty: 1,
    },
    {
      word: "merci",
      translation: "thank you",
      languageId: "fr",
      categoryId: "basics",
      example: "Merci beaucoup pour votre aide.",
      hint: "Expression of gratitude",
      difficulty: 1,
    },
    {
      word: "au revoir",
      translation: "goodbye",
      languageId: "fr",
      categoryId: "basics",
      example: "Au revoir, à bientôt!",
      hint: "Parting phrase",
      difficulty: 1,
    },

    // French - Food category
    {
      word: "le pain",
      translation: "bread",
      languageId: "fr",
      categoryId: "food",
      example: "J'aime le pain frais.",
      hint: "Baked staple food",
      difficulty: 1,
    },
    {
      word: "le fromage",
      translation: "cheese",
      languageId: "fr",
      categoryId: "food",
      example: "La France est connue pour son fromage.",
      hint: "Dairy product, often aged",
      difficulty: 1,
    },
    {
      word: "la pomme",
      translation: "apple",
      languageId: "fr",
      categoryId: "food",
      example: "Je mange une pomme tous les jours.",
      hint: "Red or green fruit",
      difficulty: 1,
    },
  ];
};

/**
 * Seed the database with vocabulary data
 */
const seedVocabulary = async () => {
  try {
    // Connect to the database directly
    console.log("Attempting to connect to MongoDB...");
    await connectToDatabase();
    console.log("Connection successful!");

    // Delete all existing vocabulary items
    console.log("Deleting existing vocabulary items...");
    await Vocabulary.deleteMany({});

    // Generate vocabulary items
    console.log("Generating vocabulary items...");
    const vocabularyItems = generateVocabularyItems();

    console.log("Adding new vocabulary items...");
    await Vocabulary.insertMany(vocabularyItems);

    console.log(
      `Vocabulary seeded successfully! Added ${vocabularyItems.length} items.`
    );
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding vocabulary: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedVocabulary();
