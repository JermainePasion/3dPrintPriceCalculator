import mongoose from "mongoose"

const chatBotSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },   // link to anonymous user session
  role: { type: String, enum: ["user", "bot"], required: true },
  message: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model("ChatBot", chatBotSchema)