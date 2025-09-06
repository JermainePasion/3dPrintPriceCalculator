// server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid"
import ChatBot from "./models/ChatBot.js"
import Calculation from "./models/Calculation.js"
import { askGemini } from "./services/gemini.js"

dotenv.config()

const app = express()


app.use(cors())
app.use(express.json())


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err))

// Basic test route
app.get("/", (req, res) => {
  res.send("3D Printing Cost Calculator API is running 🚀")
})

app.post("/api/session", (req, res) => {
  const sessionId = uuidv4()
  res.json({ sessionId })
})

app.post("/api/calculations", async (req, res) => {
  try {
    const { sessionId, ...calcData } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" })
    }

    const calc = new Calculation({ sessionId, ...calcData })
    await calc.save()
    res.status(201).json(calc)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get("/api/calculations/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const calculations = await Calculation.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
    res.json(calculations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


app.post("/api/chat/ask", async (req, res) => {
  try {
    const { sessionId, message } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" })
    }
    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    // Get last 10 calculations
    const calculations = await Calculation.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)

    // Ask Gemini
    const reply = await askGemini(message, calculations)

    res.json({ reply })
  } catch (err) {
    console.error("❌ Error in /api/chat/ask:", err.message)
    res.status(500).json({ error: "Something went wrong." })
  }
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
