import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setError("");
    setMessage("");

    // NEW SUPABASE V3 SIGN UP SYNTAX
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin, // safe and correct
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    // **IMPORTANT**
    // Supabase V3 ALWAYS sets confirmed_at = null
    // but we will still allow login later (handled in Login.js)

    setMessage("Account created! You can log in now 💗");
  };

  return (
    <div className="auth-wrapper">
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

      <div className="auth-box">
        <h2 className="auth-title">Join Project SHE ✨</h2>

        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <button className="auth-btn" onClick={handleRegister}>
          Register
        </button>

        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
