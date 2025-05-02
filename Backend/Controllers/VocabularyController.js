const Vocabulary = require("../Models/Vocabulary");
const UserVocabulary = require("../Models/UserVocabulary");
const mongoose = require("mongoose");

// Get random vocabulary words for a specific language and category
exports.getRandomVocabulary = async (req, res) => {
  try {
    const { languageId, categoryId, limit = 10 } = req.query;

    // Validation
    if (!languageId) {
      return res.status(400).json({ message: "Language ID is required" });
    }

    // Base query
    const query = { languageId };

    // Add category filter if provided
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Get random vocabulary items using aggregation
    const vocabularyItems = await Vocabulary.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } },
    ]);

    // If user is authenticated, get their progress on these words
    if (req.user) {
      // Get vocabulary IDs
      const vocabIds = vocabularyItems.map((item) => item._id);

      // Find user progress for these vocabulary items
      const userProgress = await UserVocabulary.find({
        userId: req.user._id,
        vocabularyId: { $in: vocabIds },
      });

      // Create a map for quick lookups
      const progressMap = {};
      userProgress.forEach((item) => {
        progressMap[item.vocabularyId.toString()] = item;
      });

      // Attach user progress to vocabulary items
      vocabularyItems.forEach((item) => {
        const progress = progressMap[item._id.toString()];
        item.userStatus = progress ? progress.status : "new";
        item.timesReviewed = progress ? progress.timesReviewed : 0;
      });
    }

    res.status(200).json(vocabularyItems);
  } catch (error) {
    console.error("Error getting random vocabulary:", error);
    res.status(500).json({ message: "Failed to fetch vocabulary" });
  }
};

// Get all vocabulary categories for a language
exports.getCategories = async (req, res) => {
  try {
    const { languageId } = req.query;

    if (!languageId) {
      return res.status(400).json({ message: "Language ID is required" });
    }

    // Use aggregation to get unique categories
    const categories = await Vocabulary.aggregate([
      { $match: { languageId } },
      { $group: { _id: "$categoryId" } },
      { $project: { _id: 0, categoryId: "$_id" } },
    ]);

    res.status(200).json(categories.map((c) => c.categoryId));
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Update user's vocabulary progress
exports.updateUserProgress = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { vocabularyId, status } = req.body;

    if (!vocabularyId || !status) {
      return res
        .status(400)
        .json({ message: "Vocabulary ID and status are required" });
    }

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(vocabularyId)) {
      return res.status(400).json({ message: "Invalid vocabulary ID" });
    }

    // Validate status
    const validStatuses = ["new", "learning", "known", "mastered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update or create user vocabulary progress
    const userProgress = await UserVocabulary.findOneAndUpdate(
      { userId: req.user._id, vocabularyId },
      {
        $set: {
          status,
          lastReviewed: new Date(),
          updatedAt: new Date(),
        },
        $inc: {
          timesReviewed: 1,
          timesCorrect: status === "known" || status === "mastered" ? 1 : 0,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json(userProgress);
  } catch (error) {
    console.error("Error updating vocabulary progress:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

// Get user's vocabulary progress
exports.getUserProgress = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { languageId, categoryId, status } = req.query;

    // Build the query
    const query = { userId: req.user._id };

    // Get the user vocabulary progress with population
    let userProgressQuery = UserVocabulary.find(query).populate({
      path: "vocabularyId",
      match: {},
    });

    // If status filter is provided
    if (status) {
      userProgressQuery = userProgressQuery.find({ status });
    }

    // Execute the query
    let userProgress = await userProgressQuery.lean();

    // Post-process to filter by language and category if needed
    if (languageId || categoryId) {
      userProgress = userProgress.filter((progress) => {
        if (!progress.vocabularyId) return false;

        const matchesLanguage =
          !languageId || progress.vocabularyId.languageId === languageId;
        const matchesCategory =
          !categoryId || progress.vocabularyId.categoryId === categoryId;

        return matchesLanguage && matchesCategory;
      });
    }

    // Format response
    const formattedProgress = userProgress
      .map((progress) => ({
        ...progress.vocabularyId,
        status: progress.status,
        timesReviewed: progress.timesReviewed,
        timesCorrect: progress.timesCorrect,
        lastReviewed: progress.lastReviewed,
      }))
      .filter((item) => item.word); // Filter out items where vocabulary was deleted

    res.status(200).json(formattedProgress);
  } catch (error) {
    console.error("Error getting user vocabulary progress:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};

// Add new vocabulary word
exports.addVocabulary = async (req, res) => {
  try {
    const {
      word,
      translation,
      languageId,
      categoryId,
      example,
      hint,
      difficulty,
      imageUrl,
    } = req.body;

    // Basic validation
    if (!word || !translation || !languageId || !categoryId) {
      return res.status(400).json({
        message: "Word, translation, language ID, and category ID are required",
      });
    }

    // Create new vocabulary
    const newVocabulary = new Vocabulary({
      word,
      translation,
      languageId,
      categoryId,
      example,
      hint,
      difficulty,
      imageUrl,
    });

    await newVocabulary.save();
    res.status(201).json(newVocabulary);
  } catch (error) {
    console.error("Error adding vocabulary:", error);
    res.status(500).json({ message: "Failed to add vocabulary" });
  }
};
