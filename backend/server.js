// server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import ChatBot from "./models/ChatBot.js"
import Calculation from "./models/Calculation.js"
import { askGemini } from "./services/gemini.js"
import Session from "./models/Session.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err))

// Test route
app.get("/", (req, res) => {
  res.send("3D Printing Cost Calculator API is running 🚀")
})

// ✅ Create new session
app.post("/api/session", async (req, res) => {
  try {
    const session = new Session(); // UUID _id generated automatically
    await session.save();
    res.json({ sessionId: session._id }); // send string to frontend
  } catch (err) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

async function validateSession(sessionId) {
  if (!sessionId) return false;
  return await Session.exists({ _id: sessionId });
}


// ✅ Get calculations for a session
app.get("/api/calculations/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!(await validateSession(sessionId))) {
      return res.status(403).json({ error: "Session expired" });
    }

    const calculations = await Calculation.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(calculations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/calculations", async (req, res) => {
  try {
    const { sessionId, ...calcData } = req.body;

    console.log("Request body:", req.body);

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const valid = await validateSession(sessionId);
    if (!valid) {
      return res.status(403).json({ error: "Session expired. Please refresh." });
    }

    // --- Explicit total cost calculation (so it's always correct) ---
    const printHours = Number(calcData.printHours) || 0;
    const printMinutes = Number(calcData.printMinutes) || 0;

    const totalPrintTimeHours = printHours + printMinutes / 60;

    const filamentCostPerGram = calcData.pricePerSpool / 1000;
    const filamentCost = filamentCostPerGram * calcData.weightGrams;

    const electricityTotal = calcData.electricityCost * totalPrintTimeHours;

    const baseCost = filamentCost + electricityTotal;

    const totalCost = baseCost * (1 + calcData.markupPercent / 100);

    // Save with computed totalCost
    const calc = new Calculation({
      sessionId,
      ...calcData,
      totalCost,
    });

    await calc.save();

    // ✅ Return the saved calculation with totalCost (markup included)
    res.status(201).json(calc);

  } catch (err) {
    console.error("Error saving calculation:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Chat endpoint
app.post("/api/chat/ask", async (req, res) => {
  try {
    const { sessionId, message } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" })
    }
    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    const valid = await validateSession(sessionId)
    if (!valid) {
      return res.status(403).json({ error: "Session expired. Please refresh." })
    }

    // Save user message
    await new ChatBot({ sessionId, role: "user", message }).save()

    // Get last 10 calculations + chats
    const calculations = await Calculation.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)

    const chats = await ChatBot.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)

    // Ask Gemini
    const reply = await askGemini(message, calculations, chats)

    // Save assistant reply
    await new ChatBot({ sessionId, role: "assistant", message: reply }).save()

    res.json({ reply })
  } catch (err) {
    console.error("❌ Error in /api/chat/ask:", err.message)
    res.status(500).json({ error: "Something went wrong." })
  }
})


// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
