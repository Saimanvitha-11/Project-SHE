import React, { useState } from "react";
import "./mentalHealthTracker.css";

const moodEmojis = ["😭", "😟", "😐", "😊", "🤩"];
const stressLevels = [
  { label: "Low", emoji: "🟢" },
  { label: "Moderate", emoji: "🟡" },
  { label: "High", emoji: "🔴" },
];
const energyEmojis = ["🛌", "😴", "😐", "😊", "💃"];

export default function MentalHealthTracker() {
  const [mood, setMood] = useState(null);
  const [stress, setStress] = useState(null);
  const [energy, setEnergy] = useState(null);

  return (
    <div className="container-mental-health">
      <div className="mental-health-card">
        <h1>🧠 Mental Health Tracker</h1>

        {/* Mood */}
        <div className="tracker-section">
          <h2>How are you feeling today?</h2>
          <div className="emoji-row">
            {moodEmojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => setMood(emoji)}
                className={`emoji-button ${mood === emoji ? "selected" : ""}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Stress */}
        <div className="tracker-section">
          <h2>Stress Level</h2>
          <div className="stress-row">
            {stressLevels.map((level, idx) => (
              <button
                key={idx}
                onClick={() => setStress(level.label)}
                className={`stress-button ${
                  stress === level.label ? "selected" : ""
                }`}
              >
                <span style={{ fontSize: "1.2rem" }}>{level.emoji}</span>{" "}
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="tracker-section">
          <h2>Energy Level</h2>
          <div className="emoji-row">
            {energyEmojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => setEnergy(emoji)}
                className={`emoji-button ${energy === emoji ? "selected" : ""}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
