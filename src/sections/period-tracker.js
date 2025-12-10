import React, { useState, useEffect } from "react";
import "./period-tracker.css";

/**
 * PeriodTracker — Project SHE goddess mode
 *
 * Usage: import PeriodTracker and add to your sections list.
 *
 * Features:
 * - Input last period date + cycle length
 * - Predict next period / ovulation
 * - Compute current phase and show phase-specific UI
 * - In-app toasts + optional Browser Notifications
 * - Moon-ring visualization of cycle
 * - Symptom logging saved in localStorage (connects to mental-health tracker)
 */

const PHASES = [
  { 
    key: "menstruation",
    label: "Moon Phase",
    color: "linear-gradient(135deg, #2b193d, #3c1a5b)", 
    textColor: "#f6e9ff"
  },
  { 
    key: "follicular",
    label: "Bloom Phase",
    color: "linear-gradient(135deg, #fff0f6, #ffd6e8)", 
    textColor: "#b03060"
  },
  { 
    key: "ovulation",
    label: "Power Phase",
    color: "linear-gradient(135deg, #fff4e1, #ffd6a5)",
    textColor: "#c05621"
  },
  { 
    key: "luteal",
    label: "Soft Phase",
    color: "linear-gradient(135deg, #f4efff, #e6dbff)", 
    textColor: "#6b4c9a"
  },
];

const DEFAULT_CYCLE = 28;
const DEFAULT_MENSES_LENGTH = 5;

function daysBetween(a, b) {
  const _a = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const _b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const diff = Math.round((_b - _a) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PeriodTracker() {
  const [lastPeriodDate, setLastPeriodDate] = useState(
    localStorage.getItem("period_lastDate") || ""
  );
  const [cycleLength, setCycleLength] = useState(
    parseInt(localStorage.getItem("period_cycle")) || DEFAULT_CYCLE
  );
  const [mensesLength, setMensesLength] = useState(
    parseInt(localStorage.getItem("period_mensesLength")) || DEFAULT_MENSES_LENGTH
  );

  const [todayIndex, setTodayIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [nextPeriodDate, setNextPeriodDate] = useState("");
  const [ovulationWindow, setOvulationWindow] = useState("");
  const [toast, setToast] = useState(null);
  const [symptoms, setSymptoms] = useState(
    JSON.parse(localStorage.getItem("period_symptoms") || "[]")
  );

  // Phase-specific self care suggestions
  const SUGGESTIONS = {
    menstruation: [
      "Rest when you can — sheets, warm tea, gentle warmth.",
      "Prioritize comfort: cozy clothing and soft music.",
      "Hydrate and use heat for cramps.",
    ],
    follicular: [
      "Creative energy is rising — jot ideas and small goals.",
      "Go for a light walk; gentle movement helps.",
      "Meal prep nourishing foods to sustain momentum.",
    ],
    ovulation: [
      "Power phase — take on bold tasks if you feel energized.",
      "Schedule calls/interviews on these high-energy days.",
      "Hydrate, do strength training if you like.",
    ],
    luteal: [
      "Be gentle with decisions; journal feelings instead of reacting.",
      "Lower intensity workouts and extra sleep if possible.",
      "Try grounding breathing for emotional storms.",
    ],
  };

  // Compute cycle state whenever inputs change
  useEffect(() => {
    if (!lastPeriodDate) return;
    const lastDate = new Date(lastPeriodDate);
    const now = new Date();
    const daysSince = daysBetween(lastDate, now);
    // modulo cycle to find current day index in cycle (0-based)
    const mod = ((daysSince % cycleLength) + cycleLength) % cycleLength;
    setTodayIndex(mod);

    // Simple heuristic for phase splits:
    // menstruation: day 0 .. mensesLength-1
    // follicular: mensesLength .. ovulationStart-1
    // ovulation: ovulationStart .. ovulationEnd
    // luteal: rest to cycleLength-1
    const ovulationCenter = Math.round(cycleLength - 14);
 // heuristic
    const ovStart = Math.max( Math.floor(ovulationCenter - 2), mensesLength );
    const ovEnd = Math.min(ovStart + 4, cycleLength - 1);

    let pIndex = 0;
    if (mod < mensesLength) pIndex = 0;
    else if (mod >= mensesLength && mod < ovStart) pIndex = 1;
    else if (mod >= ovStart && mod <= ovEnd) pIndex = 2;
    else pIndex = 3;
    setPhaseIndex(pIndex);

    // predictions
    const nextStart = new Date(lastDate);
    nextStart.setDate(lastDate.getDate() + cycleLength);
    setNextPeriodDate(nextStart.toDateString());

    const ovStartDate = new Date(lastDate);
    ovStartDate.setDate(lastDate.getDate() + ovStart);
    const ovEndDate = new Date(lastDate);
    ovEndDate.setDate(lastDate.getDate() + ovEnd);
    setOvulationWindow(`${ovStartDate.toDateString()} — ${ovEndDate.toDateString()}`);
  }, [lastPeriodDate, cycleLength, mensesLength]);

  // Save inputs to localStorage
  useEffect(() => {
    localStorage.setItem("period_lastDate", lastPeriodDate || "");
    localStorage.setItem("period_cycle", cycleLength.toString());
    localStorage.setItem("period_mensesLength", mensesLength.toString());
  }, [lastPeriodDate, cycleLength, mensesLength]);

  // Toast helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4500);
  };

  // Optional Browser notification (asks permission)
  const notifyBrowser = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(title, { body });
      });
    }
  };

  const handlePredict = () => {
    if (!lastPeriodDate) {
      showToast("Please select your last period start date first.");
      return;
    }
    showToast(`Next period predicted: ${nextPeriodDate}`);
  };

  const handleQuickNotify = (type = "gentle") => {
    // choose a friendly message depending on phase
    const phaseKey = PHASES[phaseIndex].key;
    const messages = {
      gentle: {
        menstruation: "Hey love — your softer days are here. Be kind to yourself.",
        follicular: "Blooming energy — a gentle nudge to create something small today.",
        ovulation: "Power phase — you're radiant. Use this energy well.",
        luteal: "Soft days approaching — check in on your mind and rest.",
      },
      health: {
        menstruation: "Pain/flow likely — consider a heat pack & hydration.",
        follicular: "Stamina increasing — great for light movement.",
        ovulation: "High energy — hydrate & consider heavier tasks.",
        luteal: "Emotionally sensitive — try grounding & journaling.",
      },
    };
    const text = messages[type][phaseKey];
    showToast(text);
    notifyBrowser("Project SHE • Cycle Reminder", text);
  };

  const saveSymptom = (payload) => {
    const entry = {
      date: new Date().toDateString(),
      ...payload,
      phase: PHASES[phaseIndex].key,
    };
    const updated = [entry, ...symptoms].slice(0, 90); // keep 90 records
    setSymptoms(updated);
    localStorage.setItem("period_symptoms", JSON.stringify(updated));

    // connect to mental health: write a simple key so your MentalHealthTracker can read it
    localStorage.setItem("period_lastSymptomMood", JSON.stringify({ date: entry.date, mood: entry.mood }));
    showToast("Saved — gentle reminder noted. 💗");
  };

  // quick preset symptom logging
  const quickLog = (mood = "ok", pain = 0, energy = 5) => {
    saveSymptom({ mood, pain, energy });
  };

  // visual ring data building
  const ringDays = Array.from({ length: cycleLength }, (_, i) => {
    const isToday = i === todayIndex;
    // decide color by phase of that day
    let dayPhase = 1;
    if (i < mensesLength) dayPhase = 0;
    else if (i >= mensesLength && i < Math.max(Math.floor(cycleLength * 0.5) - 2, mensesLength)) dayPhase = 1;
    else if (i >= Math.max(Math.floor(cycleLength * 0.5) - 2, mensesLength) && i <= Math.min(Math.max(Math.floor(cycleLength * 0.5) - 2, mensesLength) + 4, cycleLength-1)) dayPhase = 2;
    else dayPhase = 3;
    return { dayIndex: i, dayPhase, isToday };
  });

  const currentPhaseKey = PHASES[phaseIndex].key;
  const currentPhaseLabel = PHASES[phaseIndex].label;

  return (
    <div
      className="period-tracker-container"
      style={{ background: PHASES[phaseIndex].color }}
    >
      <div className="period-top">
        <div className="left">
          <h2 style={{ color: PHASES[phaseIndex].textColor }}>
  🌙 Period Tracker — {currentPhaseLabel}
</h2>

<p 
  className="subtitle"
  style={{ color: PHASES[phaseIndex].textColor, opacity: 0.85 }}
>
  A gentle guardian for your cycle — private & compassionate.
</p>


          <div className="inputs">
            <label>Last period start:</label>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
            />
            <label>Cycle length (days):</label>
            <input
              type="number"
              min="21"
              max="40"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
            />
            <label>Typical menses length (days):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={mensesLength}
              onChange={(e) => setMensesLength(Number(e.target.value))}
            />
            <div className="buttons-row">
              <button className="period-btn" onClick={handlePredict}>Predict Next</button>
              <button className="period-btn ghost" onClick={() => handleQuickNotify("gentle")}>Gentle Reminder</button>
            </div>
            <p className="predict-small">Next: <strong>{nextPeriodDate || "—"}</strong> • Ovulation: <strong>{ovulationWindow || "—"}</strong></p>
          </div>
        </div>

        <div className="right">
          <div className="moon-ring" role="img" aria-label="Cycle ring">
            {/* Simple ring using divs for each day */}
            {ringDays.map((d) => (
              <div
                key={d.dayIndex}
                className={`ring-segment phase-${d.dayPhase} ${d.isToday ? "today" : ""}`}
                title={`Day ${d.dayIndex + 1} • ${d.isToday ? "Today" : ""}`}
                style={{ transform: `rotate(${(360 / cycleLength) * d.dayIndex}deg)` }}
              />
            ))}
            <div className="ring-center">
              <div className="phase-label">{currentPhaseLabel}</div>
              <div className="phase-key">{currentPhaseKey}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="middle">
        <div className="phase-card">
          <h3>{PHASES[phaseIndex].label} • {currentPhaseKey}</h3>
          <p className="phase-copy">{SUGGESTIONS[PHASES[phaseIndex].key][0]}</p>
          <ul className="suggestions">
            {SUGGESTIONS[PHASES[phaseIndex].key].map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <div className="phase-actions">
            <button className="period-btn" onClick={() => handleQuickNotify("health")}>Health Tip</button>
            <button className="period-btn ghost" onClick={() => quickLog("ok", 2, 5)}>Quick Log</button>
          </div>
        </div>

        <div className="symptom-card">
          <h4>Log a symptom</h4>
          <div className="sym-row">
            <label>Mood</label>
            <select id="mood-select" onChange={(e) => { /* no-op */ }}>
              <option>—</option>
            </select>
          </div>
          <div className="sym-row quicks">
            <button className="small" onClick={() => saveSymptom({ mood: "tired", pain: 3, energy: 3 })}>Tired</button>
            <button className="small" onClick={() => saveSymptom({ mood: "low", pain: 5, energy: 2 })}>Cramps</button>
            <button className="small" onClick={() => saveSymptom({ mood: "ok", pain: 1, energy: 5 })}>OK</button>
          </div>

          <h5>Recent logs</h5>
          <div className="logs">
            {symptoms.slice(0,6).map((s, i) => (
              <div key={i} className="log-item">
                <div className="log-date">{s.date}</div>
                <div className="log-meta">{s.mood} • pain:{s.pain} • e:{s.energy}</div>
              </div>
            ))}
            {symptoms.length === 0 && <p className="muted">No logs yet — quick log to remember how you felt.</p>}
          </div>
        </div>
      </div>

      {toast && <div className="period-toast">{toast}</div>}
    </div>
  );
}
