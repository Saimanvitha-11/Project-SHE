import React, { useState, useEffect } from "react";
import "./personalized-motivational-reminders.css";
import { supabase } from "../supabaseClient";

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
    "Let the {noun} inside you bloom effortlessly {emoji}",
    "Your heart glows with {noun} today—carry it gently {emoji}",
    "Your {noun} shines brightly—remember to {microAction} {emoji}",
    "Every moment today is touched by {noun} {emoji}",
    "Let {noun} dance around you softly {emoji}",
    "Carry {noun} like a soft melody through your day {emoji}",
    "Your presence radiates {noun}—share it freely {emoji}"
  ],

  sad: [
    "It's okay to feel {noun} today—remember {microAction} {emoji}",
    "Even the heaviest clouds drift eventually—{microAction} {emoji}",
    "Your heart holds {noun}—it's okay to pause {emoji}",
    "You’re allowed to sit with {noun} gently {emoji}",
    "Let {noun} flow without judgment—breathe softly {emoji}",
    "Your {noun} is not weakness—it’s honesty {emoji}",
    "Hold {noun} with compassion today {emoji}",
    "Let {noun} be felt, then slowly soften {emoji}",
    "Every wave of {noun} passes—take one breath {emoji}",
    "You can honor your {noun} and still heal {emoji}"
  ],

  tired: [
    "Rest is sacred. Recharge with {noun} {emoji}",
    "Your {noun} needs a pause—{microAction} {emoji}",
    "Let {noun} replenish you softly {emoji}",
    "Slow down, embrace {noun}, tomorrow you’ll shine {emoji}",
    "Your body whispers for {noun}—listen gently {emoji}",
    "Let {noun} be your blanket today {emoji}",
    "Rest is productive—honor {noun} within you {emoji}",
    "Let {noun} wrap around your mind like calm {emoji}",
    "You’re doing enough—let {noun} hold you {emoji}",
    "Give yourself permission to rest with {noun} {emoji}"
  ],

  motivated: [
    "Every small step is a victory—move with {noun} {emoji}",
    "Your {noun} fuels your journey—{microAction} {emoji}",
    "Shine with {noun}, and take a mindful step {emoji}",
    "Your focus and {noun} create magic—remember {microAction} {emoji}",
    "Let {noun} guide your boldness today {emoji}",
    "There is fire in your {noun}—use it wisely {emoji}",
    "Let {noun} push you toward your goals {emoji}",
    "Your {noun} is powerful—trust it {emoji}",
    "Today is shaped by your {noun}—take one fearless step {emoji}",
    "Carry {noun} in your stride—you’re becoming unstoppable {emoji}"
  ],

  anxious: [
    "Anchor yourself in this moment—focus on {noun} {emoji}",
    "Your {noun} is enough—breathe and {microAction} {emoji}",
    "Let {noun} ground you—then {microAction} {emoji}",
    "Your heart deserves {noun}—slow down {emoji}",
    "Let {noun} steady your breath today {emoji}",
    "Hold {noun} close when your thoughts race {emoji}",
    "Center your mind with {noun}—one breath at a time {emoji}",
    "Let {noun} soften the edges of your worries {emoji}",
    "You're safe—let {noun} guide your grounding {emoji}",
    "Let {noun} calm your inner storm {emoji}"
  ]
};

  const [selectedMood, setSelectedMood] = useState("happy");
  const [currentReminder, setCurrentReminder] = useState("");
  const [reminders, setReminders] = useState([]);
  const [streak, setStreak] = useState(0);

  // ------------------------------
  // FETCH REMINDERS FROM SUPABASE
  // ------------------------------
  const fetchReminders = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("motivational_reminders")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false });

    setReminders(data || []);

    // streak = total reminders (simple but effective)
    setStreak(data?.length || 0);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ------------------------------
  // GENERATE + SAVE REMINDER
  // ------------------------------
  const generateReminder = async (mood) => {
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

    // Save to Supabase
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const payload = {
      user_id: user.data.user.id,
      mood,
      reminder_text: reminder
    };

    const { data, error } = await supabase
      .from("motivational_reminders")
      .insert(payload)
      .select();

    if (!error && data) {
      setReminders([data[0], ...reminders]);
      setStreak((prev) => prev + 1);
    }
  };

  return (
    <div className="reminder-container">
      <h3 className="section-title">✨ Personalized Motivational Reminders ✨</h3>

      <div className="mood-buttons">
        {moods.map((mood) => (
          <button
            key={mood}
            className={`mood-button ${selectedMood === mood ? "selected" : ""}`}
            onClick={() => {
              setSelectedMood(mood);
              generateReminder(mood);
            }}
          >
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </button>
        ))}
      </div>

      <div className="current-reminder-card">
        <p className="reminder-text">{currentReminder}</p>
        <p className="streak">🌟 Streak: {streak}</p>
      </div>

      <div className="previous-reminders">
        <h4>Previous reminders:</h4>
        {reminders.map((r) => (
          <div key={r.id} className="previous-card">
            {r.reminder_text}
          </div>
        ))}
      </div>
    </div>
  );
}
