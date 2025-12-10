import React, { useState, useEffect } from "react";
import "./personalized-motivational-reminders.css";

export default function PersonalizedMotivationalReminders() {
  const moods = ["happy", "sad", "tired", "motivated", "anxious"];

  const nouns = ["sunlight", "love", "warmth", "peace", "laughter", "serenity", "joy"];
  const actions = ["breathe", "shine", "flow", "rest", "embrace", "smile"];
  const microActions = [
    "take a deep breath",
    "write down 3 things you love",
    "stretch your arms and smile",
    "notice one thing that brings you peace",
    "give yourself a gentle hug"
  ];
  const emojis = ["🌸", "✨", "💛", "🌿", "💖", "🌞", "💫", "🌙"];

  const templates = {
    happy: [
      "Your {noun} today sparkles {emoji}, let it guide your steps",
      "Feel {noun} within and around you {emoji}, and {microAction}",
      "Keep spreading {noun}, your light touches everyone {emoji}",
      "Let the {noun} you carry today bloom {emoji}",
      "Your {noun} shines brightly—remember to {microAction} {emoji}",
      "Embrace {noun} and share it gently {emoji}",
      "Today, {noun} is your ally—flow with it {emoji}",
      "Let {noun} guide your heart today {emoji}",
      "Carry {noun} softly wherever you go {emoji}",
      "Your {noun} lifts everyone around—breathe and {microAction} {emoji}"
    ],
    sad: [
      "Even the heaviest clouds drift eventually—{microAction} {emoji}",
      "It's okay to feel {noun} today—remember {microAction} {emoji}",
      "Give space for {noun}, it’s part of your journey {emoji}",
      "Let {noun} settle softly inside you {emoji}, {microAction}",
      "Your {noun} is valid, and it's safe to {microAction} {emoji}",
      "Today, {noun} can rest—breathe and {microAction} {emoji}",
      "Gently acknowledge {noun}, and {microAction} {emoji}",
      "Feel {noun} without judgment—then {microAction} {emoji}",
      "Your heart holds {noun}—it's okay to pause {emoji}",
      "Embrace the moment of {noun}—softly {microAction} {emoji}"
    ],
    tired: [
      "Rest is sacred. Recharge with {noun} {emoji}",
      "Your {noun} needs a pause—{microAction} {emoji}",
      "Slow down, embrace {noun}, tomorrow you’ll shine {emoji}",
      "Take {noun} inside and gently {microAction} {emoji}",
      "Allow {noun} to guide your rest {emoji}, {microAction}",
      "Your energy flows with {noun}—pause and {microAction} {emoji}",
      "Breathe with {noun} today {emoji}, and {microAction}",
      "Embrace stillness and {microAction} {emoji}",
      "Let {noun} replenish you softly {emoji}, {microAction}",
      "Your {noun} deserves care—take a moment and {microAction} {emoji}"
    ],
    motivated: [
      "Every small step is a victory—move with {noun} {emoji}",
      "Your {noun} fuels your journey—{microAction} {emoji}",
      "Harness {noun} and take one brave step forward {emoji}",
      "Let {noun} guide your actions today {emoji}, {microAction}",
      "Your focus and {noun} create magic—remember {microAction} {emoji}",
      "Flow with {noun} and embrace progress {emoji}, {microAction}",
      "Today, {noun} empowers you—act gently {emoji}",
      "Carry {noun} forward and {microAction} {emoji}",
      "Your {noun} is unstoppable—softly {microAction} {emoji}",
      "Shine with {noun}, and take a mindful step {emoji}, {microAction}"
    ],
    anxious: [
      "Anchor yourself in this moment—focus on {noun} {emoji}, {microAction}",
      "Your {noun} is enough—breathe and {microAction} {emoji}",
      "Let {noun} guide you—softly {microAction} {emoji}",
      "Gently notice {noun}—and {microAction} {emoji}",
      "Your {noun} can calm the mind—remember {microAction} {emoji}",
      "Center yourself with {noun} and {microAction} {emoji}",
      "Focus on {noun} today—softly {microAction} {emoji}",
      "Embrace {noun} and {microAction} {emoji}",
      "Your heart holds {noun}—breathe and {microAction} {emoji}",
      "Let {noun} ground you—then {microAction} {emoji}"
    ]
  };

  const [selectedMood, setSelectedMood] = useState("happy");
  const [currentReminder, setCurrentReminder] = useState("");
  const [reminders, setReminders] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedStreak = localStorage.getItem("reminderStreak");
    if (savedStreak) setStreak(parseInt(savedStreak));
    generateReminder(selectedMood);
  }, []);

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const generateReminder = (mood) => {
    const template = getRandomItem(templates[mood]);
    const noun = getRandomItem(nouns);
    const action = getRandomItem(actions);
    const microAction = getRandomItem(microActions);
    const emoji = getRandomItem(emojis);
    const reminder = template
      .replace("{noun}", noun)
      .replace("{action}", action)
      .replace("{microAction}", microAction)
      .replace("{emoji}", emoji);
    setCurrentReminder(reminder);
    setReminders((prev) => [reminder, ...prev]);
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("reminderStreak", newStreak);
  };

  return (
    <div className="reminder-container">
      <h3 className="section-title">✨ Personalized Motivational Reminders ✨</h3>

      <div className="mood-buttons">
        {moods.map((mood) => (
          <button
            key={mood}
            className={`mood-button ${selectedMood === mood ? "selected" : ""}`}
            onClick={() => { setSelectedMood(mood); generateReminder(mood); }}
          >
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </button>
        ))}
      </div>

      <div className="current-reminder-card">
        <p className="reminder-text">{currentReminder}</p>
        <p className="streak">🌟 Streak: {streak}</p>
        <div className="sparkle-container">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="sparkle"></span>
          ))}
        </div>
      </div>

      <div className="previous-reminders">
        <h4>Previous reminders:</h4>
        {reminders.map((r, index) => (
          <div key={index} className="previous-card">{r}</div>
        ))}
      </div>
    </div>
  );
}
