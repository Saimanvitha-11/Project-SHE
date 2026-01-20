import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./fitness-dashboard.css";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FitnessDashboard = () => {
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState("");
  const [sleep, setSleep] = useState("");
  const [mood, setMood] = useState("😊");

  const [weeklySteps, setWeeklySteps] = useState({
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  });

  const today = days[new Date().getDay()];

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("fitness_daily")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSteps(data.steps || "");
      setWater(data.water || "");
      setSleep(data.sleep || "");
      setMood(data.mood || "😊");
      setWeeklySteps(data.weekly_steps || weeklySteps);
    }
  };

  // ---------------- SAVE DATA ----------------
  const saveData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updatedWeekly = {
      ...weeklySteps,
      [today]: Number(steps || 0),
    };

    await supabase.from("fitness_daily").upsert({
      user_id: user.id,
      steps: Number(steps),
      water: Number(water),
      sleep: Number(sleep),
      mood,
      weekly_steps: updatedWeekly,
    });

    alert("Progress saved! 💖");
  };

  return (
    <div className="fit-wrapper">
      <h1 className="fit-title">✨ Fitness & Health Dashboard ✨</h1>

      <div className="fit-grid">
        {/* ------- INPUT CARD ------- */}
        <div className="fit-card">
          <h2 className="fit-card-title">Daily Input 💗</h2>

          <label>🚶‍♀️ Steps</label>
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="10000"
          />

          <label>💧 Water (L)</label>
          <input
            type="number"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            placeholder="2.5"
          />

          <label>🌙 Sleep (hrs)</label>
          <input
            type="number"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="8"
          />

          <label>🧠 Mood</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="😊">😊 Happy</option>
            <option value="😔">😔 Sad</option>
            <option value="😤">😤 Stressed</option>
            <option value="😌">😌 Calm</option>
            <option value="🥰">🥰 Loved</option>
          </select>

          <button onClick={saveData} className="fit-save">
            Save
          </button>
        </div>

        {/* ------- WEEKLY STEPS CHART ------- */}
        <div className="fit-card">
          <h2 className="fit-card-title">Weekly Steps 📊</h2>

          <div className="steps-chart">
            {days.map((d) => (
              <div key={d} className="chart-col">
                <div
                  className="chart-bar"
                  style={{ height: `${weeklySteps[d] / 150}px` }}
                ></div>
                <p className="chart-label">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ------- WATER ------- */}
        <div className="fit-card">
          <h2 className="fit-card-title">Water 💦</h2>
          <div className="water-bar">
            <div
              className="water-fill"
              style={{ width: `${(water / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* ------- SLEEP ------- */}
        <div className="fit-card">
          <h2 className="fit-card-title">Sleep 😴</h2>
          <div className="sleep-ring">
            <div
              className="sleep-fill"
              style={{
                transform: `rotate(${(sleep / 12) * 360}deg)`,
              }}
            ></div>
          </div>
        </div>

        {/* ------- SUMMARY ------- */}
        <div className="fit-summary">
          <h2>💖 Summary</h2>
          <p>Steps: {steps || "—"}</p>
          <p>Water: {water || "—"} L</p>
          <p>Sleep: {sleep || "—"} hrs</p>
          <p>Mood: {mood}</p>
        </div>
      </div>
    </div>
  );
};

export default FitnessDashboard;
