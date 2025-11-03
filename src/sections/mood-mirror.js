import React, { useState } from "react";
import "./mood-mirror.css";

export default function MoodMirror() {
  const [mood, setMood] = useState("");

  const moodData = {
    happy: {
      bg: "linear-gradient(to right, #ffecd2, #fcb69f)",
      message: "Your smile is your superpower today ✨",
      emoji: "😊"
    },
    calm: {
      bg: "linear-gradient(to right, #cfd9df, #e2ebf0)",
      message: "Peace flows through you like a gentle river 🌊",
      emoji: "🌿"
    },
    sad: {
      bg: "linear-gradient(to right, #a1c4fd, #c2e9fb)",
      message: "It's okay to feel this way — gentleness is your friend 💙",
      emoji: "💧"
    },
    energetic: {
      bg: "linear-gradient(to right, #f6d365, #fda085)",
      message: "You're unstoppable today — chase the magic! ⚡",
      emoji: "🔥"
    },
    stressed: {
      bg: "linear-gradient(to right, #ff9a9e, #fad0c4)",
      message: "Breathe in courage, breathe out tension 💗",
      emoji: "😮‍💨"
    }
  };

  return (
    <div
      className="mood-mirror-container"
      style={{
        background: moodData[mood]?.bg || "#f5f5f5",
        transition: "background 0.6s ease-in-out"
      }}
    >
      <h2 className="mood-title">Mood Mirror 💫</h2>
      <p className="mood-subtitle">Select your current mood:</p>

      <div className="mood-buttons">
        {Object.keys(moodData).map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`mood-btn ${mood === m ? "active" : ""}`}
          >
            {moodData[m].emoji} {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {mood && (
        <div className="mood-display">
          <div className="mood-emoji">{moodData[mood].emoji}</div>
          <p className="mood-message">{moodData[mood].message}</p>
        </div>
      )}
    </div>
  );
}
