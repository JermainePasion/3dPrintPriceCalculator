import mongoose from "mongoose"

const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  role: { type: String, enum: ["user", "bot"], required: true },
  message: String,
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  }
}, { timestamps: true })

chatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("ChatBot", chatSchema)
