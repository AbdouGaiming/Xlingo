const express = require("express");
const router = express.Router();
const lessonController = require("../Controllers/LessonController");
const { verifyToken } = require("../Middleware/auth");

// Public routes
router.get("/", lessonController.getAllLessons);
router.get("/language/:language", lessonController.getLessonsByLanguage);
router.get("/:id", lessonController.getLessonById);

// Protected routes (require authentication)
router.post("/", verifyToken, lessonController.createLesson);
router.put("/:id", verifyToken, lessonController.updateLesson);
router.delete("/:id", verifyToken, lessonController.deleteLesson);

module.exports = router;