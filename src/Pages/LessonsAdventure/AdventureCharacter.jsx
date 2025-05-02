import React, { useEffect, useState, useRef } from "react";
import "./AdventureCharacter.scss";

const AdventureCharacter = ({ position, characterState, userName, level }) => {
  const [characterClass, setCharacterClass] = useState("idle");
  const [faceExpression, setFaceExpression] = useState("neutral");
  const [facingDirection, setFacingDirection] = useState(1); // 1 for right, -1 for left
  const characterRef = useRef(null);
  const prevPositionRef = useRef(position);
  const jumpingRef = useRef(false);
  const idleTimerRef = useRef(null);

  // Update character animation state based on props
  useEffect(() => {
    // Clear idle timer when state changes from idle
    if (characterClass === "idle" && characterState !== "idle") {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      setFaceExpression("neutral"); // Reset face on action
    }

    if (characterState === "celebrating") {
      setCharacterClass("celebrating");
      setFaceExpression("happy");
      const timeout = setTimeout(() => {
        setCharacterClass("idle");
        setFaceExpression("neutral");
      }, 3000);
      return () => clearTimeout(timeout);
    } else if (characterState === "jumping") {
      setCharacterClass("jumping");
      setFaceExpression("surprised");
      jumpingRef.current = true;
      const timeout = setTimeout(() => {
        setCharacterClass("idle");
        setFaceExpression("neutral");
        jumpingRef.current = false;
      }, 1000);
      return () => clearTimeout(timeout);
    } else if (
      position.x !== prevPositionRef.current.x ||
      position.y !== prevPositionRef.current.y
    ) {
      // Determine direction
      const direction =
        position.x > prevPositionRef.current.x
          ? 1
          : position.x < prevPositionRef.current.x
          ? -1
          : facingDirection;
      setFacingDirection(direction);

      setCharacterClass("walking");
      setFaceExpression("neutral");

      // Store the previous position *after* calculating direction
      prevPositionRef.current = position;

      const timeout = setTimeout(() => {
        setCharacterClass("idle");
      }, 1200); // Duration should match CSS transition

      return () => clearTimeout(timeout);
    } else {
      // Only set to idle if not already idle to prevent resetting timers
      if (characterClass !== "idle") {
        setCharacterClass("idle");
      }
    }
  }, [position, characterState, facingDirection, characterClass]); // Added dependencies

  // Handle idle animations and face expressions when waiting
  useEffect(() => {
    if (characterClass === "idle") {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        const expressions = ["bored", "thinking", "looking-around", "neutral"];
        const randomIndex = Math.floor(Math.random() * expressions.length);
        setFaceExpression(expressions[randomIndex]);
        idleTimerRef.current = setTimeout(() => {
          setFaceExpression("neutral");
          // Optionally loop the idle expressions
          // idleTimerRef.current = null; // Reset to allow restarting the 5s timer
        }, 3000); // Duration of the expression
      }, 5000); // Wait 5 seconds before showing idle expressions
    }

    // Cleanup timer on unmount or when characterClass changes
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [characterClass]);

  // Set character position and facing direction with CSS
  const characterStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `translate(-50%, -50%)`, // Removed scaleX
  };

  // Determine head direction class
  const headDirectionClass =
    facingDirection === 1 ? "facing-right" : "facing-left";

  return (
    <div
      ref={characterRef}
      className={`character-container ${characterClass}`}
      style={characterStyle} // Use combined style
    >
      {/* Level badge */}
      <div className="character-level">{level}</div>

      {/* Character model with unified body structure */}
      <div className="character">
        {/* Head with expressions and direction */}
        <div
          className={`character-head expression-${faceExpression} ${headDirectionClass}`}
        >
          <div className="character-hair"></div>
          <div className="character-face">
            <div className="character-eyebrows">
              <div className="character-eyebrow left"></div>
              <div className="character-eyebrow right"></div>
            </div>
            <div className="character-eyes">
              <div className="character-eye left">
                <div className="character-pupil"></div>
              </div>
              <div className="character-eye right">
                <div className="character-pupil"></div>
              </div>
            </div>
            <div className="character-nose"></div>
            <div className="character-mouth"></div>
          </div>
        </div>

        {/* Unified Body - Simplified Structure */}
        <div className="character-body">
          {/* Arms */}
          <div className="character-arm left">
            <div className="character-shoulder"></div>
            <div className="character-upper-arm"></div>
            <div className="character-elbow"></div>
            <div className="character-lower-arm"></div>
            <div className="character-hand">
              <div className="character-fingers"></div>
            </div>
          </div>
          <div className="character-arm right">
            <div className="character-shoulder"></div>
            <div className="character-upper-arm"></div>
            <div className="character-elbow"></div>
            <div className="character-lower-arm"></div>
            <div className="character-hand">
              <div className="character-fingers"></div>
            </div>
          </div>

          {/* Torso */}
          <div className="character-torso">
            <div className="character-chest"></div>
            <div className="character-waist"></div>
          </div>

          {/* Legs */}
          <div className="character-legs">
            <div className="character-leg left">
              <div className="character-upper-leg"></div>
              <div className="character-knee"></div>
              <div className="character-lower-leg"></div>
              <div className="character-ankle"></div>
              <div className="character-foot"></div>
            </div>
            <div className="character-leg right">
              <div className="character-upper-leg"></div>
              <div className="character-knee"></div>
              <div className="character-lower-leg"></div>
              <div className="character-ankle"></div>
              <div className="character-foot"></div>
            </div>
          </div>
        </div>

        {/* Dynamic shadow */}
        <div className="character-shadow"></div>
      </div>

      {/* Character name */}
      <div className="character-name">{userName || "Explorer"}</div>
    </div>
  );
};

export default AdventureCharacter;
