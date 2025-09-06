// services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) // flash = cheaper + faster

export async function askGemini(message, calculations = []) {
  let context = "You are a helpful 3D printing cost assistant for small Filipino business owners.\n"

  if (calculations.length > 0) {
    context += "\nRecent calculations:\n"
    calculations.forEach((c, i) => {
      context += `#${i + 1}: Material=${c.material}, Weight=${c.weightGrams}g, Time=${c.printTimeHours}h, Cost=₱${c.totalCost}\n`
    })
  }

  context += `\nUser asks: ${message}`

  const result = await model.generateContent(context)
  return result.response.text()
}
