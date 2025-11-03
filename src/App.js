import React, { useRef } from "react";
import "./styles.css";

// Import your section components
import DayWiseTracker from "./sections/day-wise-tracker";
import BuiltInSpotify from "./sections/built-in-spotify.js";
import FitnessAndHealthTracker from "./sections/fitness-and-health-tracker";
import MentalHealthTracker from "./sections/mental-health-tracker";
import JournalingPage from "./sections/journaling-page";
import AiAssistant from "./sections/ai-assistant";
import MoodMirror from "./sections/mood-mirror";
import SelfWinsWalls from "./sections/self-wins-walls";
import PersonalizedMotivationalReminders from "./sections/personalized-motivational-reminders.js";
import CareerAndLearningTracker from "./sections/career-and-learning-tracker";
import FutureLetters from "./sections/future-letters";
import VisionBoard from "./sections/vision-board";
import SafePlaceMode from "./sections/safe-place-mode";
import MiniGratitudeJournal from "./sections/mini-gratitude-journal";
import MyRuleBook from "./sections/my-rule-book";
import BookTracker from "./sections/book-tracker";

function App() {
  const sectionsRef = useRef(null);

  // ✅ SAFELY create section refs
  const sectionRefs = useRef([]);
  const totalSections = 16;

  if (sectionRefs.current.length !== totalSections) {
    sectionRefs.current = Array.from({ length: totalSections }, () => React.createRef());
  }

  const sectionComponents = [
    DayWiseTracker,
    BuiltInSpotify,
    FitnessAndHealthTracker,
    MentalHealthTracker,
    JournalingPage,
    AiAssistant,
    MoodMirror,
    SelfWinsWalls,
    PersonalizedMotivationalReminders,
    CareerAndLearningTracker,
    FutureLetters,
    VisionBoard,
    SafePlaceMode,
    MiniGratitudeJournal,
    MyRuleBook,
    BookTracker,
  ];

  const handleScroll = () => {
    sectionsRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="App">
      {/* Falling Petals */}
      {Array.from({ length: 15 }).map((_, i) => (
        <span
          key={`petal-${i}`}
          className="petal"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 100}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
          }}
        />
      ))}

      {/* Sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={`sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* First Section */}
      <section className="container">
        <h1>Welcome to Project SHE</h1>
        <p className="subtitle">
          A safe, healing, growing space for the future me 🤍
        </p>
        <button className="enter-btn" onClick={handleScroll}>
          Enter
        </button>
      </section>

      {/* Healing & Growth Journey Section */}
      <section ref={sectionsRef} className="journey-container">
        <h2>My Healing & Growth Journey 🌸</h2>
        <div className="grid">
          {sectionComponents.map((Component, i) => (
            <div
              key={i}
              className="card"
              onClick={() => scrollToSection(i)}
              style={{ cursor: "pointer" }}
            >
              {Component.name.replace(/([A-Z])/g, " $1").trim()}
            </div>
          ))}
        </div>

        {/* Render Sections */}
        {sectionComponents.map((Component, i) => (
          <div key={i} ref={sectionRefs.current[i]} style={{ margin: "2rem 0" }}>
            <Component />
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
