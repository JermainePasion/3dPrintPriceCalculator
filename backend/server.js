// server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

import ChatBot from "./models/ChatBot.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
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

// Example route for saving a calculation
import Calculation from "./models/Calculation.js"

app.post("/api/calculations", async (req, res) => {
  try {
    const calc = new Calculation(req.body)
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

app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId, role, message } = req.body
    const chat = new ChatBot({ sessionId, role, message })
    await chat.save()
    res.status(201).json(chat)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get("/api/chat/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const chats = await ChatBot.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
    res.json(chats.reverse()) // return oldest → newest
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
