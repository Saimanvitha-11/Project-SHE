import React, { useState, useEffect } from "react";
import "./fitness-health-tracker.css";

const FitnessAndHealthTracker = () => {
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState("");
  const [sleep, setSleep] = useState("");
  const [mood, setMood] = useState("😊");
  const [showPopup, setShowPopup] = useState(false);

  const [workouts, setWorkouts] = useState([
    { name: "Morning Yoga", checked: false },
    { name: "Cardio Session", checked: false },
    { name: "Strength Training", checked: false },
    { name: "Evening Walk", checked: false },
  ]);

  const toggleWorkout = (index) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index].checked = !updatedWorkouts[index].checked;
    setWorkouts(updatedWorkouts);
  };

  useEffect(() => {
    // Trim and parse input safely
    const numericSteps = parseInt(steps.trim(), 10);
    const numericWater = parseFloat(water.trim());
    const numericSleep = parseFloat(sleep.trim());

    console.log(
      "Steps:",
      numericSteps,
      "Water:",
      numericWater,
      "Sleep:",
      numericSleep
    );

    if (
      !isNaN(numericSteps) &&
      !isNaN(numericWater) &&
      !isNaN(numericSleep) &&
      numericSteps >= 10000 &&
      numericWater >= 4 &&
      numericSleep >= 8 &&
      numericSleep <= 10
    ) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [steps, water, sleep]);

  return (
    <div className="fitness-wrapper">
      <h2 className="fitness-title">Fitness & Health ✨</h2>

      <div className="input-card">
        <label>🌸 Steps Walked Today</label>
        <input
          type="number"
          placeholder="e.g. 5000"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />

        <label>💧 Water Intake (liters)</label>
        <input
          type="number"
          placeholder="e.g. 2.5"
          value={water}
          onChange={(e) => setWater(e.target.value)}
          step="0.1"
          min="0"
        />

        <label>🌙 Hours Slept</label>
        <input
          type="number"
          placeholder="e.g. 7"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          step="0.1"
          min="0"
        />

        <label>🧠 Mood Tracker</label>
        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="😊">😊 Happy</option>
          <option value="😔">😔 Sad</option>
          <option value="😤">😤 Stressed</option>
          <option value="😌">😌 Calm</option>
          <option value="🥰">🥰 Loved</option>
        </select>

        <div className="workout-section">
          <label className="workout-title">💪 Workout Sessions</label>
          <ul className="workout-list">
            {workouts.map((workout, idx) => (
              <li key={idx} className="workout-item">
                <label>
                  <input
                    type="checkbox"
                    checked={workout.checked}
                    onChange={() => toggleWorkout(idx)}
                  />
                  <span className="workout-text">{workout.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary-card">
        <h3>Your Daily Summary 💖</h3>
        <p>🚶‍♀️ Steps: {steps || "–"}</p>
        <p>💦 Water: {water ? `${water} L` : "–"}</p>
        <p>🛌 Sleep: {sleep ? `${sleep} hrs` : "–"}</p>
        <p>Mood: {mood}</p>
        <p>
          Workouts Done:{" "}
          {workouts.filter((w) => w.checked).length > 0
            ? workouts
                .filter((w) => w.checked)
                .map((w) => w.name)
                .join(", ")
            : "None"}
        </p>
      </div>

      {showPopup && (
        <div className="popup-congrats">
          You're doing amazing, never forget that 🥹💖
          <br />
          Keep going!
          <br />
          <button
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              backgroundColor: "#ba7183",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
            onClick={() => setShowPopup(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default FitnessAndHealthTracker;
