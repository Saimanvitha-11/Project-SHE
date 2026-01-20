import React, { useRef, useState, useEffect } from "react";
import "./styles.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// AUTH PAGES
import Login from "./auth/Login";
import Register from "./auth/Register";

// Import Section Components
import DayWiseTracker from "./sections/day-wise-tracker";
import BuiltInSpotify from "./sections/built-in-spotify.js";
import FitnessDashboard from "./sections/fitness-dashboard";
import MentalHealthDashboard from "./sections/mental-health-dashboard";
import JournalingPage from "./sections/journaling-page";
import AiAssistant from "./sections/ai-assistant";
import MoodMirror from "./sections/mood-mirror";
import SelfWinsWalls from "./sections/self-wins-walls";
import PersonalizedMotivationalReminders from "./sections/personalized-motivational-reminders.js";
import CareerAndLearningTracker from "./sections/career-and-learning-tracker.js";
import PeriodTracker from "./sections/period-tracker.js";
import VisionBoard from "./sections/vision-board";



/* ---------------- PROTECTED ROUTE ---------------- */
function ProtectedRoute({ children }) {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) return null;

  // Allow unconfirmed users too
  return session ? children : <Navigate to="/login" replace />;
}

/* ---------------- MAIN PROJECT SHE UI ---------------- */
function ProjectSHEApp() {
  const heroRef = useRef(null);
  const menuRef = useRef(null);

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
  FitnessDashboard,
  MentalHealthDashboard,
  JournalingPage,
  AiAssistant,
  MoodMirror,
  SelfWinsWalls,
  PersonalizedMotivationalReminders,
  CareerAndLearningTracker,
  PeriodTracker,
  VisionBoard,
  ];

  const [showTopBtn, setShowTopBtn] = useState(true);

  useEffect(() => {
    const handleScrollVisibility = () => {
      setShowTopBtn(true);
    };

    window.addEventListener("scroll", handleScrollVisibility);
    return () =>
      window.removeEventListener("scroll", handleScrollVisibility);
  }, []);

  const handleScroll = () => {
    heroRef.current.classList.add("fade-out");

    setTimeout(() => {
      menuRef.current.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

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

      {/* HERO */}
      <section ref={heroRef} className="container">
        <h1>Welcome to Project SHE</h1>
        <p className="subtitle">
          A safe, healing, growing space for the future me 🤍
        </p>
        <button className="enter-btn" onClick={handleScroll}>
          Enter
        </button>
      </section>

      {/* MENU */}
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

        {/* SECTION COMPONENTS */}
        {sectionComponents.map((Component, i) => (
          <div
            key={i}
            ref={sectionRefs.current[i]}
            style={{ margin: "3rem 0" }}
          >
            <Component />
          </div>
        ))}
      </section>

      {/* ALWAYS VISIBLE */}
      <button className="back-to-menu" onClick={goToMenu}>
        ⬆ Menu
      </button>
    </div>
  );
}


/* ---------------- ROUTER WRAPPER ---------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/fitness" element={<FitnessDashboard />} />

        {/* Protected route for the entire Project SHE */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProjectSHEApp />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
