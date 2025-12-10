import React, { useRef, useState, useEffect } from "react";
import "./styles.css";

// Import Section Components
import DayWiseTracker from "./sections/day-wise-tracker";
import BuiltInSpotify from "./sections/built-in-spotify.js";
import FitnessAndHealthTracker from "./sections/fitness-and-health-tracker";
import MentalHealthTracker from "./sections/mental-health-tracker";
import JournalingPage from "./sections/journaling-page";
import AiAssistant from "./sections/ai-assistant";
import MoodMirror from "./sections/mood-mirror";
import SelfWinsWalls from "./sections/self-wins-walls";
import PersonalizedMotivationalReminders from "./sections/personalized-motivational-reminders.js";
import CareerAndLearningTracker from "./sections/career-and-learning-tracker.js";
import PeriodTracker from "./sections/period-tracker.js";
import VisionBoard from "./sections/vision-board";

function App() {
  const heroRef = useRef(null);
  const menuRef = useRef(null);

  // Refs for all sections
  const sectionRefs = useRef([]);
  const totalSections = 16;

  if (sectionRefs.current.length !== totalSections) {
    sectionRefs.current = Array.from({ length: totalSections }, () =>
      React.createRef()
    );
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
    PeriodTracker,
    VisionBoard,
  ];

  // Show floating "Back to Menu" button
  const [showTopBtn, setShowTopBtn] = useState(true);

  useEffect(() => {
    const handleScrollVisibility = () => {
      if (window.scrollY > 200) setShowTopBtn(true);
      else setShowTopBtn(true); // Always visible for now
    };

    window.addEventListener("scroll", handleScrollVisibility);
    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, []);

  // ENTER → Fade out → Scroll down
  const handleScroll = () => {
    heroRef.current.classList.add("fade-out");

    setTimeout(() => {
      menuRef.current.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  // Scroll to a section
  const scrollToSection = (index) => {
    sectionRefs.current[index]?.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Back to Menu button
  const goToMenu = () => {
    menuRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="App">
      {/* Floating petals */}
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

      {/* HERO SECTION */}
      <section ref={heroRef} className="container">
        <h1>Welcome to Project SHE</h1>
        <p className="subtitle">
          A safe, healing, growing space for the future me 🤍
        </p>
        <button className="enter-btn" onClick={handleScroll}>
          Enter
        </button>
      </section>

      {/* MENU SECTION */}
      <section ref={menuRef} className="journey-container">
        <h2>My Healing & Growth Journey 🌸</h2>

        <div className="grid">
          {sectionComponents.map((Component, i) => (
            <div
              key={i}
              className="card"
              onClick={() => scrollToSection(i)}
            >
              {Component.name.replace(/([A-Z])/g, " $1").trim()}
            </div>
          ))}
        </div>

        {/* RENDER SECTION CONTENT */}
        {sectionComponents.map((Component, i) => (
          <div key={i} ref={sectionRefs.current[i]} style={{ margin: "3rem 0" }}>
            <Component />
          </div>
        ))}
      </section>

      {/* ALWAYS VISIBLE BACK TO MENU BUTTON */}
      <button className="back-to-menu" onClick={goToMenu}>
        ⬆ Menu
      </button>
    </div>
  );
}

export default App;
