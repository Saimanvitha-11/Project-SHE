import React, { useState, useEffect, useCallback } from "react";
import "./period-tracker.css";
import { supabase } from "../supabaseClient";

/* ==============================
   PERIOD TRACKER CONSTANTS
============================== */

const PHASES = [
  { key: "menstruation", label: "Moon Phase", color: "linear-gradient(135deg,#2b193d,#3c1a5b)", textColor: "#f6e9ff" },
  { key: "follicular", label: "Bloom Phase", color: "linear-gradient(135deg,#fff0f6,#ffd6e8)", textColor: "#b03060" },
  { key: "ovulation", label: "Power Phase", color: "linear-gradient(135deg,#fff4e1,#ffd6a5)", textColor: "#c05621" },
  { key: "luteal", label: "Soft Phase", color: "linear-gradient(135deg,#f4efff,#e6dbff)", textColor: "#6b4c9a" },
];

const DEFAULT_CYCLE = 28;
const DEFAULT_MENSES_LENGTH = 5;

/* ==============================
   DATE HELPERS
============================== */

function daysBetween(a, b) {
  const _a = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const _b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((_b - _a) / (1000 * 60 * 60 * 24));
}

/* ==============================
   MAIN COMPONENT
============================== */

export default function PeriodTracker() {
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(DEFAULT_CYCLE);
  const [mensesLength, setMensesLength] = useState(DEFAULT_MENSES_LENGTH);

  const [todayIndex, setTodayIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [nextPeriodDate, setNextPeriodDate] = useState("");
  const [ovulationWindow, setOvulationWindow] = useState("");

  const [symptoms, setSymptoms] = useState([]);
  const [toast, setToast] = useState(null);

  /* ==============================
     FETCH USER'S SETTINGS (from Supabase)
  ============================== */
  const fetchSettings = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("period_cycle_settings")
      .select("*")
      .eq("user_id", user.data.user.id)
      .single();

    if (data) {
      setLastPeriodDate(data.last_period_date);
      setCycleLength(data.cycle_length);
      setMensesLength(data.menses_length);
    }
  };

  /* ==============================
     FETCH SYMPTOMS
  ============================== */
  const fetchSymptoms = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("period_symptoms")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false });

    setSymptoms(data || []);
  };

  useEffect(() => {
    fetchSettings();
    fetchSymptoms();
  }, []);

  /* ==============================
     COMPUTE PHASES & DATES
  ============================== */
  useEffect(() => {
    if (!lastPeriodDate) return;

    const lastDate = new Date(lastPeriodDate);
    const now = new Date();
    const daysSince = daysBetween(lastDate, now);

    const mod = ((daysSince % cycleLength) + cycleLength) % cycleLength;
    setTodayIndex(mod);

    const ovCenter = Math.round(cycleLength - 14);
    const ovStart = Math.max(Math.floor(ovCenter - 2), mensesLength);
    const ovEnd = Math.min(ovStart + 4, cycleLength - 1);

    let pIndex = 0;
    if (mod < mensesLength) pIndex = 0;
    else if (mod < ovStart) pIndex = 1;
    else if (mod <= ovEnd) pIndex = 2;
    else pIndex = 3;
    setPhaseIndex(pIndex);

    const nextStart = new Date(lastDate);
    nextStart.setDate(lastDate.getDate() + cycleLength);
    setNextPeriodDate(nextStart.toDateString());

    const ovStartDate = new Date(lastDate);
    ovStartDate.setDate(lastDate.getDate() + ovStart);

    const ovEndDate = new Date(lastDate);
    ovEndDate.setDate(lastDate.getDate() + ovEnd);

    setOvulationWindow(`${ovStartDate.toDateString()} — ${ovEndDate.toDateString()}`);
  }, [lastPeriodDate, cycleLength, mensesLength]);

  /* ==============================
     SAVE SETTINGS (Auto Sync)
  ============================== */
  const saveSettings = useCallback(async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    await supabase.from("period_cycle_settings").upsert({
      user_id: user.data.user.id,
      last_period_date: lastPeriodDate,
      cycle_length: cycleLength,
      menses_length: mensesLength,
      updated_at: new Date(),
    });
  }, [lastPeriodDate, cycleLength, mensesLength]);

  useEffect(() => {
    if (!lastPeriodDate) return;
    saveSettings();
  }, [lastPeriodDate, saveSettings]);

  /* ==============================
     SAVE SYMPTOMS
  ============================== */
  const saveSymptom = async (payload) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const entry = {
      user_id: user.data.user.id,
      date: new Date().toISOString().split("T")[0],
      ...payload,
      phase: PHASES[phaseIndex].key,
    };

    const { data } = await supabase
      .from("period_symptoms")
      .insert(entry)
      .select();

    if (data) {
      setSymptoms([data[0], ...symptoms]);
      showToast("Saved — gentle reminder noted. 💗");
    }
  };

  /* ==============================
     TOAST
  ============================== */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  /* ==============================
     QUICK-LOG
  ============================== */
  const quickLog = (mood, pain, energy) => {
    saveSymptom({ mood, pain, energy });
  };

  /* ==============================
     PHASE DATA FOR RING
  ============================== */
  const ringDays = Array.from({ length: cycleLength }, (_, i) => ({
    dayIndex: i,
    isToday: i === todayIndex,
    phase:
      i < mensesLength
        ? 0
        : i < Math.round(cycleLength * 0.5) - 2
        ? 1
        : i <= Math.round(cycleLength * 0.5) + 2
        ? 2
        : 3,
  }));

  const currentPhaseKey = PHASES[phaseIndex].key;
  const currentPhaseLabel = PHASES[phaseIndex].label;

  return (
  <div
    className="period-tracker-container"
    data-phase={PHASES[phaseIndex].key}
    style={{ background: PHASES[phaseIndex].color }}
  >

      {/* LEFT SIDE */}
      <div className="period-top">
        <div className="left">
          <h1 className="mental-title">
            🌙 Period Tracker — {currentPhaseLabel}
          </h1> 
          <p className="subtitle" style={{ color: PHASES[phaseIndex].textColor }}>
            A gentle guardian for your cycle — private & compassionate.
          </p>

          <div className="inputs">
            <label>Last period start</label>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
            />

            <label>Cycle length (days)</label>
            <input
              type="number"
              value={cycleLength}
              min="21"
              max="40"
              onChange={(e) => setCycleLength(Number(e.target.value))}
            />

            <label>Typical menses length</label>
            <input
              type="number"
              value={mensesLength}
              min="2"
              max="10"
              onChange={(e) => setMensesLength(Number(e.target.value))}
            />

            <button className="period-btn" onClick={() => showToast(`Next period: ${nextPeriodDate}`)}>
              Predict Next
            </button>

            <p className="predict-small">
              Next: <strong>{nextPeriodDate}</strong> • Ovulation: <strong>{ovulationWindow}</strong>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE RING */}
        <div className="right">
          <div className="moon-ring">
            {ringDays.map((d) => (
              <div
                key={d.dayIndex}
                className={`ring-segment phase-${d.phase} ${d.isToday ? "today" : ""}`}
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

      {/* SYMPTOM LOGGING */}
      <div className="middle">
        <div className="phase-card">
          <h3>{currentPhaseLabel} • {currentPhaseKey}</h3>
          <p className="phase-copy">Listening to your body helps you flow better.</p>

          <button className="period-btn" onClick={() => quickLog("ok", 2, 5)}>Quick Log</button>
        </div>

        <div className="symptom-card">
          <h4>Recent logs</h4>
          <div className="logs">
            {symptoms.slice(0, 8).map((s) => (
              <div className="log-item" key={s.id}>
                <div className="log-date">{s.date}</div>
                <div className="log-meta">{s.mood} • pain: {s.pain} • energy: {s.energy}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && <div className="period-toast">{toast}</div>}
    </div>
  );
}
