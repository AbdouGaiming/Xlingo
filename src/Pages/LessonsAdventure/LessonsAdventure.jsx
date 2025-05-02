import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdventureCharacter from "./AdventureCharacter";
import LessonPath from "./LessonPath";
import "./LessonsAdventure.scss";

const LessonsAdventure = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [characterPosition, setCharacterPosition] = useState({
    x: 200,
    y: 400, // Adjusted Y position for first row
  });
  const [characterState, setCharacterState] = useState("walking");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(1); // Track current unit
  const adventureWorldRef = useRef(null);
  const viewportRef = useRef(null);

  // Mock user data - in a real app, this would come from context/state
  const userData = {
    name: "Language Explorer",
    level: 3,
  };

  // Organize lessons into units (rows) with proper horizontal progression
  // Units are organized by rows, each row representing a "unit" of content
  const generateLessons = () => {
    const unitRowHeight = 350; // Vertical spacing between rows/units
    const nodeHorizontalSpacing = 250; // Horizontal spacing between nodes
    const nodesPerUnit = 6; // Number of lessons per unit row

    // Define unit themes for variety
    const unitThemes = [
      { name: "Jungle Basics", icon: "🌴" },
      { name: "Forest Phrases", icon: "🌲" },
      { name: "Ocean Vocabulary", icon: "🌊" },
      { name: "Mountain Grammar", icon: "⛰️" },
      { name: "Desert Expressions", icon: "🏜️" },
    ];

    // Generate 30 lessons organized into units
    const allLessons = [];
    const totalLessons = 30;

    for (let i = 0; i < totalLessons; i++) {
      // Calculate unit (row) number and position within unit
      const unitIndex = Math.floor(i / nodesPerUnit);
      const positionInUnit = i % nodesPerUnit;

      // Calculate x-coordinate for horizontal progression within a unit
      const baseX = 200 + positionInUnit * nodeHorizontalSpacing;

      // Calculate y-coordinate, adding some wave pattern within the row
      const unitY = 400 + unitIndex * unitRowHeight;
      const waveFactor = positionInUnit % 2 === 0 ? -30 : 30;
      const y = unitY + waveFactor;

      // Calculate the lesson difficulty and status based on position
      const difficulty = unitIndex + 1;
      let status = "locked";
      if (i < 3) {
        status = "completed";
      } else if (i < 5) {
        status = "unlocked";
      }

      // Current unit theme
      const theme = unitThemes[unitIndex % unitThemes.length];

      // Generate appropriate lesson content based on unit theme
      const lessonType = [
        "vocabulary",
        "grammar",
        "conversation",
        "listening",
        "reading",
      ][Math.floor(Math.random() * 5)];
      const lessonNumber = i + 1;

      // Create the lesson
      allLessons.push({
        id: lessonNumber,
        title: `${theme.name} ${lessonNumber}`,
        description: `${theme.icon} ${
          lessonType.charAt(0).toUpperCase() + lessonType.slice(1)
        } lesson in unit ${unitIndex + 1}`,
        position: { x: baseX, y },
        icon: theme.icon,
        unitIndex: unitIndex + 1,
        lessonType,
        status,
        xpReward: 20 + unitIndex * 5, // Rewards increase with difficulty
        timeEstimate: `${5 + unitIndex * 2} min`,
        endOfUnit: positionInUnit === nodesPerUnit - 1, // Flag last lesson in unit
      });
    }

    return allLessons;
  };

  // Load lessons
  const lessons = generateLessons();

  // Generate paths between lesson nodes
  const generatePathData = () => {
    const pathData = [];
    for (let i = 0; i < lessons.length - 1; i++) {
      // Create horizontal connections within the same unit
      const currentLesson = lessons[i];
      const nextLesson = lessons[i + 1];

      // Only connect if they're in the same unit or the current lesson is the last in its unit
      if (currentLesson.unitIndex === nextLesson.unitIndex) {
        // Regular path connection
        pathData.push({
          start: currentLesson.position,
          end: nextLesson.position,
          isCompleted:
            currentLesson.status === "completed" &&
            nextLesson.status === "completed",
        });
      } else {
        // End of unit connector - create a path that curves down to the start of the next unit
        // This creates a path from the end of one unit to the beginning of the next
        pathData.push({
          start: currentLesson.position,
          end: nextLesson.position,
          isCompleted:
            currentLesson.status === "completed" &&
            nextLesson.status === "completed",
          isUnitConnector: true,
        });
      }
    }

    return pathData;
  };

  // Generate path decorations
  const generateDecorations = (pathData) => {
    const decorationTypes = [
      "flower",
      "stone",
      "butterfly",
      "bird",
      "fruit",
      "bug",
      "tree",
      "water",
    ];
    const pathDecorations = [];

    pathData.forEach((path, index) => {
      if (!path.isUnitConnector) {
        // Regular path decorations
        const startX = path.start.x;
        const startY = path.start.y;
        const endX = path.end.x;
        const endY = path.end.y;

        // Add 1-3 decorations along the path
        const decorationsCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < decorationsCount; i++) {
          // Calculate position between start and end points
          const position = (i + 1) / (decorationsCount + 1);
          const x = startX + (endX - startX) * position;
          const y = startY + (endY - startY) * position;

          // Add some randomness to position
          const randomX = x + (Math.random() * 60 - 30);
          const randomY = y + (Math.random() * 40 - 20);

          // Select a random decoration type
          const decorationType =
            decorationTypes[Math.floor(Math.random() * decorationTypes.length)];

          pathDecorations.push({
            x: randomX,
            y: randomY,
            type: decorationType,
          });
        }
      } else {
        // Special decorations for unit connectors
        // Add more decorations to mark the transition between units
        const startX = path.start.x;
        const startY = path.start.y;
        const endX = path.end.x;
        const endY = path.end.y;

        // Add 4-6 decorations along the connector
        const decorationsCount = Math.floor(Math.random() * 3) + 4;

        for (let i = 0; i < decorationsCount; i++) {
          // Calculate curved position along the connector
          const position = (i + 1) / (decorationsCount + 1);
          const x = startX + (endX - startX) * position;
          const y = startY + (endY - startY) * position;

          // Add randomness to create a cluster of decorations
          const randomX = x + (Math.random() * 80 - 40);
          const randomY = y + (Math.random() * 60 - 30);

          // Select decoration types more likely to be unit transition markers
          const specialDecorations = ["tree", "stone", "water"];
          const decorationType =
            specialDecorations[
              Math.floor(Math.random() * specialDecorations.length)
            ];

          pathDecorations.push({
            x: randomX,
            y: randomY,
            type: decorationType,
          });
        }
      }
    });

    return pathDecorations;
  };

  // Generate paths and decorations separately to avoid circular reference
  const pathData = generatePathData();
  const decorations = generateDecorations(pathData);

  // Handle node click
  const handleNodeClick = (lesson) => {
    setSelectedLesson(lesson);
    setShowPopup(true);

    // If node is accessible, move character to it
    if (lesson.status !== "locked") {
      setCharacterState("walking");
      setCharacterPosition(lesson.position);
      setActiveNodeId(lesson.id);

      // Update current unit if changed
      if (lesson.unitIndex !== currentUnit) {
        setCurrentUnit(lesson.unitIndex);
      }
    }
  };

  // Handle path click to move to connected lesson
  const handlePathClick = (path) => {
    // Find the lesson at the end of this path
    const endLesson = lessons.find(
      (lesson) =>
        lesson.position.x === path.end.x && lesson.position.y === path.end.y
    );

    if (endLesson && endLesson.status !== "locked") {
      handleNodeClick(endLesson);
    }
  };

  // Handle character position reached
  const handlePositionReached = () => {
    setCharacterState("celebrating");
    setTimeout(() => setCharacterState("idle"), 1500);
  };

  // Handle starting a lesson
  const handleStartLesson = () => {
    if (selectedLesson) {
      setShowPopup(false);
      setCharacterState("jumping");

      // Store the selected lesson in localStorage to access it in LessonPractice
      localStorage.setItem(
        "currentLesson",
        JSON.stringify({
          id: selectedLesson.id,
          title: selectedLesson.title,
          description: selectedLesson.description,
          icon: selectedLesson.icon,
          unitIndex: selectedLesson.unitIndex,
          lessonType: selectedLesson.lessonType,
          xpReward: selectedLesson.xpReward,
        })
      );

      // Navigate to the lesson practice component
      setTimeout(() => {
        navigate(`/lesson-practice/${selectedLesson.id}`);
      }, 1000);
    }
  };

  // Change zoom level
  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev * 1.1 : prev / 1.1;
      // Limit zoom levels
      return Math.min(Math.max(0.5, newZoom), 1.5);
    });
  };

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullScreen(false));
      }
    }
  };

  // Effect to handle fullscreen change events (e.g., user pressing ESC)
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  // Set initial position and focus on specific lesson if provided in URL
  useEffect(() => {
    if (lessonId) {
      const targetLesson = lessons.find(
        (lesson) => lesson.id === parseInt(lessonId)
      );
      if (targetLesson && targetLesson.status !== "locked") {
        setCharacterPosition(targetLesson.position);
        setActiveNodeId(targetLesson.id);
        setCurrentUnit(targetLesson.unitIndex);

        // Center viewport on the target lesson
        if (viewportRef.current && adventureWorldRef.current) {
          viewportRef.current.scrollTo({
            left: targetLesson.position.x - viewportRef.current.clientWidth / 2,
            top: targetLesson.position.y - viewportRef.current.clientHeight / 2,
            behavior: "smooth",
          });
        }
      }
    } else {
      // Find the furthest unlocked/completed lesson as default position
      const availableLessons = lessons.filter(
        (lesson) => lesson.status !== "locked"
      );
      if (availableLessons.length > 0) {
        const lastAvailableLesson =
          availableLessons[availableLessons.length - 1];
        setCharacterPosition(lastAvailableLesson.position);
        setActiveNodeId(lastAvailableLesson.id);
        setCurrentUnit(lastAvailableLesson.unitIndex);

        // Center viewport on the last available lesson
        if (viewportRef.current && adventureWorldRef.current) {
          setTimeout(() => {
            viewportRef.current.scrollTo({
              left:
                lastAvailableLesson.position.x -
                viewportRef.current.clientWidth / 2,
              top:
                lastAvailableLesson.position.y -
                viewportRef.current.clientHeight / 2,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    }
  }, [lessonId]);

  // Effect to center viewport on character
  useEffect(() => {
    if (viewportRef.current && adventureWorldRef.current && characterPosition) {
      const viewportWidth = viewportRef.current.offsetWidth;
      const viewportHeight = viewportRef.current.offsetHeight;

      // Calculate desired scroll position to center the character
      const targetScrollLeft =
        characterPosition.x * zoomLevel - viewportWidth / 2;
      const targetScrollTop =
        characterPosition.y * zoomLevel - viewportHeight / 2;

      viewportRef.current.scrollTo({
        left: Math.max(0, targetScrollLeft), // Ensure scroll position isn't negative
        top: Math.max(0, targetScrollTop),
        behavior: "smooth", // Use 'smooth' for animated scrolling
      });
    }
  }, [characterPosition, zoomLevel]); // Re-run when character moves or zoom changes

  // Find current unit info for display
  const getCurrentUnitInfo = () => {
    const unitLessons = lessons.filter(
      (lesson) => lesson.unitIndex === currentUnit
    );
    if (unitLessons.length > 0) {
      const firstLesson = unitLessons[0];
      return {
        name:
          firstLesson.title.split(" ")[0] +
          " " +
          firstLesson.title.split(" ")[1],
        icon: firstLesson.icon,
        progress: calculateUnitProgress(unitLessons),
      };
    }
    return { name: "Unknown Unit", icon: "🌍", progress: 0 };
  };

  // Calculate unit completion progress
  const calculateUnitProgress = (unitLessons) => {
    if (!unitLessons || unitLessons.length === 0) return 0;
    const completedCount = unitLessons.filter(
      (lesson) => lesson.status === "completed"
    ).length;
    return Math.round((completedCount / unitLessons.length) * 100);
  };

  const unitInfo = getCurrentUnitInfo();

  return (
    <div
      className={`lessons-adventure-container ${
        isFullScreen ? "fullscreen" : ""
      }`}
    >
      {/* Controls panel */}
      <div className="adventure-controls">
        <div className="zoom-controls">
          <button className="zoom-button" onClick={() => handleZoom("in")}>
            +
          </button>
          <button className="zoom-button" onClick={() => handleZoom("out")}>
            -
          </button>
        </div>
        <button className="fullscreen-button" onClick={toggleFullScreen}>
          {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <Link to="/dashboard" className="next-lesson-button">
          Back to Dashboard
        </Link>
      </div>

      {/* Unit Progress Indicator */}
      <div className="unit-indicator">
        <div className="unit-icon">{unitInfo.icon}</div>
        <div className="unit-details">
          <h3>{unitInfo.name}</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${unitInfo.progress}%` }}
            ></div>
          </div>
          <span>{unitInfo.progress}% complete</span>
        </div>
      </div>

      {/* Main viewport */}
      <div className="adventure-viewport" ref={viewportRef}>
        <div
          className="adventure-world"
          ref={adventureWorldRef}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Jungle background */}
          <div className="jungle-background">
            <div className="jungle-floor"></div>
            <div className="jungle-trees"></div>
            <div className="jungle-plants"></div>
            <div className="jungle-particles"></div>
          </div>

          {/* Paths connecting lesson nodes */}
          <LessonPath
            paths={pathData}
            decorations={decorations}
            onPathClick={handlePathClick}
          />

          {/* Character */}
          <AdventureCharacter
            position={characterPosition}
            state={characterState}
            userName={userData.name}
            level={userData.level}
            onPositionReached={handlePositionReached}
          />

          {/* Lesson nodes */}
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`lesson-node ${lesson.status} ${
                lesson.endOfUnit ? "end-of-unit" : ""
              }`}
              style={{
                left: `${lesson.position.x}px`,
                top: `${lesson.position.y}px`,
              }}
              onClick={() => handleNodeClick(lesson)}
            >
              <div className="lesson-icon">{lesson.icon}</div>
              {lesson.endOfUnit && (
                <div className="unit-completion-badge">🏆</div>
              )}

              {/* Hover info overlay */}
              <div className="lesson-info">
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className="lesson-meta">
                  <span className={`status-badge ${lesson.status}`}>
                    {lesson.status === "completed"
                      ? "Completed"
                      : lesson.status === "unlocked"
                      ? "Unlocked"
                      : "Locked"}
                  </span>
                  {lesson.endOfUnit && (
                    <span className="unit-badge">Unit End</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Unit Labels */}
          {Array.from(new Set(lessons.map((lesson) => lesson.unitIndex))).map(
            (unitIndex) => {
              const unitLessons = lessons.filter(
                (lesson) => lesson.unitIndex === unitIndex
              );
              if (unitLessons.length === 0) return null;

              // Get first lesson in unit for positioning the label
              const firstLesson = unitLessons.reduce(
                (min, lesson) =>
                  lesson.position.x < min.position.x ? lesson : min,
                unitLessons[0]
              );

              const theme = unitLessons[0].title
                .split(" ")
                .slice(0, 2)
                .join(" ");

              return (
                <div
                  key={`unit-${unitIndex}`}
                  className="unit-label"
                  style={{
                    left: `${firstLesson.position.x - 100}px`,
                    top: `${firstLesson.position.y - 70}px`,
                  }}
                >
                  <span className="unit-number">Unit {unitIndex}</span>
                  <h2>{theme}</h2>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Lesson detail popup */}
      {showPopup && selectedLesson && (
        <div className="lesson-detail-popup">
          <div className="popup-header">
            <h2>{selectedLesson.title}</h2>
            <button
              className="close-button"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>
          </div>
          <div className="popup-content">
            <p>{selectedLesson.description}</p>
            <div className="lesson-stats">
              <div className="xp-reward">+{selectedLesson.xpReward} XP</div>
              <div className="time-estimate">{selectedLesson.timeEstimate}</div>
            </div>
            {selectedLesson.status === "completed" ? (
              <button
                className="review-lesson-button"
                onClick={handleStartLesson}
              >
                Review Lesson
              </button>
            ) : selectedLesson.status === "unlocked" ? (
              <button
                className="start-lesson-button"
                onClick={handleStartLesson}
              >
                Start Lesson
              </button>
            ) : (
              <p>Complete previous lessons to unlock this one.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsAdventure;
