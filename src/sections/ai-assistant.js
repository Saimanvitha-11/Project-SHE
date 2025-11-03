import React, { useState } from "react";
import axios from "axios";
import "./ai-assistant.css";

// ✅ Load OpenAI API key from .env
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
console.log("Loaded API key:", apiKey); // For debugging — remove in production

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

    const botMessage = await getBotResponse(input);
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  };

  const getBotResponse = async (inputText) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are SHE-Mentor, a senior Microsoft engineer helping users become job-ready for Microsoft. Provide structured guidance on DSA, system design, resume writing, interview prep, and career growth. Always be kind, encouraging, and actionable.",
            },
            {
              role: "user",
              content: inputText,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        sender: "bot",
        text: response.data.choices[0].message.content.trim(),
      };
    } catch (error) {
      console.error("❌ OpenAI API Error:", error);
      return {
        sender: "bot",
        text:
          "🚨 Sorry, something went wrong while talking to SHE-Mentor. Please try again or check your API key.",
      };
    }
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
