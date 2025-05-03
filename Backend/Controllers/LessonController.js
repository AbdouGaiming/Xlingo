const Lesson = require("../Models/Lesson");
const mongoose = require("mongoose");

// Get all lessons
exports.getAllLessons = async (req, res) => {
  try {
    const { language, type, difficulty } = req.query;
    
    // Build query filters
    const filter = {};
    if (language) filter.language = language;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = parseInt(difficulty);
    
    // Find lessons with optional filters
    const lessons = await Lesson.find(filter)
      .sort({ order: 1 })
      .populate("prerequisites", "title");
      
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching lessons", 
      error: error.message 
    });
  }
};

// Get a specific lesson by ID
exports.getLessonById = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }
    
    const lesson = await Lesson.findById(lessonId)
      .populate("prerequisites", "title");
      
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching lesson", 
      error: error.message 
    });
  }
};

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    // Create a new lesson with the request body
    const newLesson = new Lesson(req.body);
    
    // Save the new lesson
    const savedLesson = await newLesson.save();
    
    res.status(201).json(savedLesson);
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating lesson", 
      error: error.message 
    });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }
    
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.status(200).json(updatedLesson);
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating lesson", 
      error: error.message 
    });
  }
};

// Delete a lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }
    
    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);
    
    if (!deletedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting lesson", 
      error: error.message 
    });
  }
};

// Get lessons by language
exports.getLessonsByLanguage = async (req, res) => {
  try {
    const { language } = req.params;
    
    const lessons = await Lesson.find({ language })
      .sort({ order: 1 })
      .populate("prerequisites", "title");
      
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching lessons by language", 
      error: error.message 
    });
  }
};