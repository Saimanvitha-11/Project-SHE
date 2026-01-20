import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./fitness-health-tracker.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const FIXED_WORKOUTS = [
  "Morning Yoga",
  "Cardio Session",
  "Strength Training",
  "Evening Walk",
];

const moodMap = {
  "😊": 5,
  "😌": 4,
  "🥰": 4,
  "😤": 2,
  "😔": 1,
};

export default function FitnessAndHealthTracker() {
  const [loading, setLoading] = useState(true);

  // Daily inputs
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState("");
  const [sleep, setSleep] = useState("");
  const [calories, setCalories] = useState("");
  const [mood, setMood] = useState("😊");

  // Workouts
  const [fixedWorkouts, setFixedWorkouts] = useState(
    FIXED_WORKOUTS.map((w) => ({ name: w, checked: false }))
  );
  const [customWorkoutInput, setCustomWorkoutInput] = useState("");
  const [customWorkouts, setCustomWorkouts] = useState([]);

  // Last 7 days data
  const [weekData, setWeekData] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  /* ---------------- LOAD TODAY'S LOG ---------------- */
  async function loadTodayLog() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    // Check if row exists
    const { data: existingRows } = await supabase
      .from("fitness_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (existingRows) {
      setSteps(existingRows.steps || "");
      setWater(existingRows.water || "");
      setSleep(existingRows.sleep || "");
      setCalories(existingRows.calories || "");
      setMood(existingRows.mood || "😊");

      if (existingRows.workouts) {
        setCustomWorkouts(existingRows.workouts.custom || []);
        setFixedWorkouts(
          FIXED_WORKOUTS.map((w) => ({
            name: w,
            checked: existingRows.workouts.fixed?.includes(w) || false,
          }))
        );
      }
    } else {
      // Create new row for today
      await supabase.from("fitness_logs").insert([
        {
          user_id: user.id,
          date: today,
          steps: null,
          water: null,
          sleep: null,
          calories: null,
          mood: "😊",
          workouts: { fixed: [], custom: [] },
        },
      ]);
    }
  }

  /* ---------------- SAVE / UPDATE DAILY LOG ---------------- */
  async function saveTodayLog() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const fixedChecked = fixedWorkouts
      .filter((w) => w.checked)
      .map((w) => w.name);

    await supabase
      .from("fitness_logs")
      .update({
        steps: steps ? Number(steps) : null,
        water: water ? Number(water) : null,
        sleep: sleep ? Number(sleep) : null,
        calories: calories ? Number(calories) : null,
        mood,
        workouts: {
          fixed: fixedChecked,
          custom: customWorkouts,
        },
      })
      .eq("user_id", user.id)
      .eq("date", today);
  }

  /* ---------------- FETCH LAST 7 DAYS ---------------- */
  async function fetchLast7Days() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data } = await supabase
      .from("fitness_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .limit(7);

    if (data) setWeekData(data);
  }

  /* ---------------- LOAD WHEN PAGE OPENS ---------------- */
  useEffect(() => {
    (async () => {
      await loadTodayLog();
      await fetchLast7Days();
      setLoading(false);
    })();
  }, []);

  /* ---------------- SAVE WHEN ANY INPUT CHANGES ---------------- */
  useEffect(() => {
    if (!loading) saveTodayLog();
  }, [steps, water, sleep, calories, mood, fixedWorkouts, customWorkouts]);

  /* ---------------- WORKOUT HANDLERS ---------------- */
  const toggleFixedWorkout = (index) => {
    const updated = [...fixedWorkouts];
    updated[index].checked = !updated[index].checked;
    setFixedWorkouts(updated);
  };

  const addCustomWorkout = () => {
    if (!customWorkoutInput.trim()) return;
    setCustomWorkouts((prev) => [...prev, customWorkoutInput.trim()]);
    setCustomWorkoutInput("");
  };

  const deleteCustomWorkout = (i) => {
    setCustomWorkouts((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ---------------- CHART DATA ---------------- */
  const stepsChart = weekData.map((d) => ({
    day: d.date.slice(5),
    steps: d.steps || 0,
  }));

  const waterChart = weekData.map((d) => ({
    day: d.date.slice(5),
    water: d.water || 0,
  }));

  const caloriesChart = weekData.map((d) => ({
    day: d.date.slice(5),
    calories: d.calories || 0,
  }));

  const sleepChart = [
    { name: "Sleep", value: Number(sleep) || 0 },
    { name: "Remaining", value: Math.max(0, 8 - (Number(sleep) || 0)) },
  ];

  const moodChart = weekData.map((d) => ({
    day: d.date.slice(5),
    moodValue: moodMap[d.mood] || 3,
  }));

  const COLORS = ["#f489ae", "#ffe6ef"];

  if (loading) return <p>Loading…</p>;

  return (
    <div className="fitness-dashboard">
      <h2 className="fitness-main-title">✨ Fitness & Health Dashboard ✨</h2>

      <div className="fitness-layout">
        {/* LEFT PANEL (INPUTS) */}
        <div className="fitness-left">

          <div className="input-card">
            <label>🚶‍♀️ Steps Today</label>
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />

            <label>💧 Water (L)</label>
            <input
              type="number"
              step="0.1"
              value={water}
              onChange={(e) => setWater(e.target.value)}
            />

            <label>🌙 Sleep (hrs)</label>
            <input
              type="number"
              step="0.1"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
            />

            <label>🔥 Calories (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />

            <label>🧠 Mood</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="😊">😊 Happy</option>
              <option value="😌">😌 Calm</option>
              <option value="🥰">🥰 Loved</option>
              <option value="😤">😤 Stressed</option>
              <option value="😔">😔 Sad</option>
            </select>
          </div>

          {/* WORKOUTS */}
          <div className="workout-card">
            <h3>💪 Workouts</h3>

            {/* Fixed */}
            {fixedWorkouts.map((w, i) => (
              <label key={i} className="workout-item">
                <input
                  type="checkbox"
                  checked={w.checked}
                  onChange={() => toggleFixedWorkout(i)}
                />
                {w.name}
              </label>
            ))}

            {/* Custom add */}
            <div className="custom-add-row">
              <input
                type="text"
                placeholder="Add custom workout..."
                value={customWorkoutInput}
                onChange={(e) => setCustomWorkoutInput(e.target.value)}
              />
              <button onClick={addCustomWorkout}>+</button>
            </div>

            {/* Custom list */}
            {customWorkouts.map((w, i) => (
              <div key={i} className="custom-workout-item">
                <span>{w}</span>
                <button onClick={() => deleteCustomWorkout(i)}>✧</button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL (CHARTS) */}
        <div className="fitness-right">

          {/* Steps Chart */}
          <div className="chart-card">
            <h4>Weekly Steps 🚶‍♀️</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stepsChart}>
                <XAxis dataKey="day" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="steps"
                  stroke="#f489ae"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Water Chart */}
          <div className="chart-card">
            <h4>Water Intake 💧</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={waterChart}>
                <XAxis dataKey="day" />
                <Tooltip />
                <Bar dataKey="water" fill="#f489ae" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calories Chart */}
          <div className="chart-card">
            <h4>Calories 🔥</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={caloriesChart}>
                <XAxis dataKey="day" />
                <Tooltip />
                <Bar
                  dataKey="calories"
                  fill="#ff8a9a"
                  radius={[10, 10, 10, 10]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep Pie */}
          <div className="chart-card">
            <h4>Sleep Cycle 😴</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sleepChart}
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sleepChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mood Trend */}
          <div className="chart-card">
            <h4>Mood This Week 🧠</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodChart}>
                <XAxis dataKey="day" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="moodValue"
                  stroke="#c15a94"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
