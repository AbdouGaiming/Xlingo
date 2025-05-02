import React from "react";
import "./LessonPath.scss";

const LessonPath = ({ paths, decorations = [] }) => {
  // Generate SVG path elements between lesson nodes
  const generateSvgPaths = () => {
    if (!paths || paths.length === 0) return null;

    return paths.map((path, index) => {
      const { start, end, isCompleted } = path;

      // Extract coordinates for readability
      const startX = start.x;
      const startY = start.y;
      const endX = end.x;
      const endY = end.y;

      // Calculate control points for a waving (cubic Bezier) path
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const amplitude = Math.min(40, distance * 0.2); // Wave height

      // Determine if the path is mostly horizontal
      const isHorizontal = Math.abs(dx) > Math.abs(dy);

      // Create different wave patterns based on path direction
      let cp1x, cp1y, cp2x, cp2y;

      if (isHorizontal) {
        // For horizontal paths, wave up and down
        cp1x = startX + dx * 0.25;
        cp1y = startY + amplitude * (index % 2 === 0 ? 1 : -1); // Alternate wave direction
        cp2x = startX + dx * 0.75;
        cp2y = startY + amplitude * (index % 2 === 0 ? -1 : 1); // Alternate wave direction
      } else {
        // For vertical/diagonal paths, create gentle curves
        cp1x = startX + (index % 2 === 0 ? amplitude : -amplitude);
        cp1y = startY + dy * 0.25;
        cp2x = endX + (index % 2 === 0 ? -amplitude : amplitude);
        cp2y = startY + dy * 0.75;
      }

      // Create the cubic Bezier path string
      const pathString = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

      return (
        <path
          key={`path-${index}`}
          className={`lesson-path ${isCompleted ? "completed" : "incomplete"}`}
          d={pathString}
        />
      );
    });
  };

  // Generate jungle path decorations with more variety
  const generateDecorations = () => {
    if (!decorations || decorations.length === 0) return null;

    return decorations.map((decoration, index) => {
      const { x, y, type } = decoration;

      // Expanded decoration types for more variety
      const decorationIcon = (() => {
        switch (type) {
          case "flower":
            return ["🌺", "🌸", "🌼", "🌻"][index % 4];
          case "tree":
            return ["🌴", "🌲", "🌳", "🍀"][index % 4];
          case "stone":
            return ["🪨", "🌑", "⛰️"][index % 3];
          case "bug":
            return ["🐞", "🐜", "🦗", "🐌"][index % 4];
          case "butterfly":
            return ["🦋", "🦄", "🐢"][index % 3];
          case "bird":
            return ["🦜", "🦚", "🦉", "🦢"][index % 4];
          case "fruit":
            return ["🍎", "🍌", "🥥", "🍊"][index % 4];
          case "water":
            return ["💦", "🌊", "🏞️"][index % 3];
          default:
            return ["🍃", "🌿", "🌱", "🍂"][index % 4];
        }
      })();

      // Add subtle random positioning variations
      const offsetX = Math.random() * 10 - 5;
      const offsetY = Math.random() * 10 - 5;

      return (
        <div
          key={`decoration-${index}`}
          className={`path-decoration ${type}`}
          style={{
            left: `${x + offsetX}px`,
            top: `${y + offsetY}px`,
          }}
        >
          {decorationIcon}
        </div>
      );
    });
  };

  return (
    <div className="lesson-paths-container">
      {/* SVG paths between lesson nodes */}
      <svg className="lesson-paths-svg">{generateSvgPaths()}</svg>

      {/* Path decorations */}
      <div className="path-decorations">{generateDecorations()}</div>
    </div>
  );
};

export default LessonPath;
