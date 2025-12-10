import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat route for Project SHE
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are SHE-Mentor, a highly intelligent, empowering AI assistant that helps women grow emotionally, mentally, and professionally."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on http://localhost:5000`);
});
