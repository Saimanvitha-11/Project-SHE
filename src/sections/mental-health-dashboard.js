import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./mental-health-dashboard.css";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function MentalHealthDashboard() {
  const [mood, setMood] = useState(null);
  const [stress, setStress] = useState(null);
  const [energy, setEnergy] = useState(null);

  const [logs, setLogs] = useState([]);

  const moodMap = {
    "😭": 1,
    "😟": 2,
    "😐": 3,
    "😊": 4,
    "🤩": 5,
  };

  const energyMap = {
    "🛌": 1,
    "😴": 2,
    "😐": 3,
    "😊": 4,
    "💃": 5,
  };

  const stressMap = {
    Low: "🟢",
    Moderate: "🟡",
    High: "🔴",
  };

  // --------------------------
  // SAVE ENTRY TO SUPABASE
  // --------------------------
  const saveEntry = async (field, value) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { error } = await supabase.from("mental_health_logs").insert({
      user_id: user.data.user.id,
      mood: field === "mood" ? value : mood,
      stress_level: field === "stress" ? value : stress,
      energy_level: field === "energy" ? value : energy,
    });

    if (error) console.error(error);
    else fetchLogs();
  };

  // --------------------------
  // FETCH LOGS
  // --------------------------
  const fetchLogs = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("mental_health_logs")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: true });

    setLogs(data || []);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // --------------------------
  // CHART DATA CONVERSION
  // --------------------------

  const moodTrend = logs.map((log) => ({
    date: new Date(log.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    mood: moodMap[log.mood] || 0,
  }));

  const energyTrend = logs.map((log) => ({
    date: new Date(log.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    energy: energyMap[log.energy_level] || 0,
  }));

  const stressCounts = {
    Low: logs.filter((l) => l.stress_level === "Low").length,
    Moderate: logs.filter((l) => l.stress_level === "Moderate").length,
    High: logs.filter((l) => l.stress_level === "High").length,
  };

  const stressPie = [
    { name: "Low", value: stressCounts.Low },
    { name: "Moderate", value: stressCounts.Moderate },
    { name: "High", value: stressCounts.High },
  ];

  const STRESS_COLORS = ["#8be28b", "#f5e36d", "#ff6b6b"];

  return (
    <div className="mental-dashboard-wrapper">

      {/* TITLE */}
      <h1 className="mental-title">✨ Mental Wellness Dashboard ✨</h1>

      {/* INPUT SECTION */}
      <div className="mental-input-card">
        <h2 className="daily-checkin-title">Daily Check-in 🌸</h2>


        {/* MOOD */}
        <p>How are you feeling?</p>
        <div className="emoji-row">
          {["😭", "😟", "😐", "😊", "🤩"].map((m) => (
            <button
              key={m}
              className={`emoji-btn ${mood === m ? "selected" : ""}`}
              onClick={() => {
                setMood(m);
                saveEntry("mood", m);
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* STRESS */}
        <p>Stress Level</p>
        <div className="stress-row">
          {["Low", "Moderate", "High"].map((s) => (
            <button
              key={s}
              className={`stress-btn ${stress === s ? "selected" : ""}`}
              onClick={() => {
                setStress(s);
                saveEntry("stress", s);
              }}
            >
              {stressMap[s]} {s}
            </button>
          ))}
        </div>

        {/* ENERGY */}
        <p>Energy Level</p>
        <div className="emoji-row">
          {["🛌", "😴", "😐", "😊", "💃"].map((e) => (
            <button
              key={e}
              className={`emoji-btn ${energy === e ? "selected" : ""}`}
              onClick={() => {
                setEnergy(e);
                saveEntry("energy", e);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-container">

        {/* MOOD TREND */}
        <div className="chart-card">
          <h3>Mood Trend 😊</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={moodTrend}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#d96fa8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* STRESS PIE */}
        <div className="chart-card">
          <h3>Stress Levels 😟</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stressPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {stressPie.map((entry, index) => (
                  <Cell key={index} fill={STRESS_COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ENERGY TREND */}
        <div className="chart-card">
          <h3>Energy Trend ⚡</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={energyTrend}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="energy" stroke="#ff8fab" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
