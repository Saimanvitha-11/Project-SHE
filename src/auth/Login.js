import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // Correct Supabase V3 login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Success → send user to main app
    window.location.href = "/";
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
        <h2 className="auth-title">Welcome Back 🤍</h2>

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

        <button className="auth-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="auth-switch">
          New here? <a href="/register">Create an account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
