import React, { useState } from "react";
import "./ai-assistant.css";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "👋 Hi, I’m SHE-Mentor — a senior Microsoft engineer. I’ll help you prepare for your dream role. What role are you aiming for? (e.g., SDE, PM, AI/ML)",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ Backend Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "🚨 I couldn’t reach the SHE-Mentor server. Is your backend running?",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="she-mentor-container">
      <h2>SHE-Mentor (Microsoft Coach)</h2>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="chat-message bot">⏳ SHE-Mentor is typing...</div>
        )}
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Ask something like 'Give me a roadmap for SDE'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default AiAssistant;
