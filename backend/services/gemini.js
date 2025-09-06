// services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

// --- Simple rate limiting (per server instance) ---
let lastCall = 0
const MIN_DELAY = 2000 // 2s between calls

export async function askGemini(message, calculations = [], chats = [], usePro = false) {
  // 🚦 Rate limiting
  const now = Date.now()
  if (now - lastCall < MIN_DELAY) {
    const wait = ((MIN_DELAY - (now - lastCall)) / 1000).toFixed(1)
    throw new Error(`⚠️ Too many requests. Please wait ${wait}s before trying again.`)
  }
  lastCall = now

  // --- Keep prompt minimal ---
  let context = `
  You are "PrintMate", a chatbot assistant for small Filipino business owners 
who use 3D printing to sell products on Shopee/Lazada/Facebook Marketplace.
  - Keep answers short (3–5 sentences).
- Use clear, simple English (Taglish suggestions are okay for prices, e.g. "₱120 per item").
- If calculations are provided, summarize them neatly in a bullet list or table.
- always base your answer from the session's existing calculations. Do not ask for more details unless provided.
- If user asks about pricing/markup, suggest practical business tips (like shipping, packaging, Shopee fees).
- According to Makerlab Electronics and Meralco (as of april 4, 2025), for a Bambu Lab A1 Combo, an hour of printing costs around ₱1.43 to ₱1.68 per hour.
Use that aswell as a reference if asked about electricity costs.
- If question is unrelated to 3D printing business, politely redirect.
  `
  context += "Keep answers short, clear, and practical.\n"

  // Only include last 3 calculations
  if (calculations.length > 0) {
  context += "\nRecent calculations:\n"
  calculations.forEach((c, i) => {
    context += `#${i + 1}: 
- Product: ${c.product}
- Material: ${c.material}
- Weight: ${c.weightGrams}g
- Filament price: ₱${c.pricePerSpool} per spool (1kg)
- Print time: ${c.printTimeHours}h
- Electricity cost: ₱${c.electricityCost}
- Markup: ${c.markupPercent}%
- Final total cost: ₱${c.totalCost}\n\n`
  })
}

  // Only include last 5 messages
  if (chats.length > 0) {
    const recentChats = chats.slice(-5)
    context += "\nRecent chat history:\n"
    recentChats.forEach((chat) => {
      context += `${chat.role.toUpperCase()}: ${chat.message}\n`
    })
  }

  context += `\nUser asks: ${message}\n`

  // --- Try chosen model (default: flash) ---
  const model = usePro ? proModel : flashModel

  try {
    const result = await model.generateContent(context)
    return result.response.text()
  } catch (err) {
    console.error("❌ Gemini API error:", err.status, err.statusText)

    // Fallback to flash if pro fails (429/quota/etc.)
    if (usePro && err.status === 429) {
      console.log("⚡ Falling back to gemini-1.5-flash")
      const result = await flashModel.generateContent(context)
      return result.response.text()
    }

    throw err
  }
}
