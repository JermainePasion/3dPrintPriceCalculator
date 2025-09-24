import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const flashLiteModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

let lastCall = 0
const MIN_DELAY = 2000 // 2s cooldown to avoid rate limit

export async function askGemini(message, calculations = [], chats = []) {

  const now = Date.now()
  if (now - lastCall < MIN_DELAY) {
    const wait = ((MIN_DELAY - (now - lastCall)) / 1000).toFixed(1)
    throw new Error(`⚠️ Too many requests. Please wait ${wait}s before trying again.`)
  }
  lastCall = now


  let context = `
You are a chatbot assistant for small Filipino business owners 
who use 3D printing to sell products on Shopee/Lazada/Facebook Marketplace.

- Keep answers short (3–5 sentences).
- Use clear, simple English (Taglish suggestions are okay for prices, e.g. "₱120 per item").
- Summarize calculation neatly in a bullet list **only if user asks**.
- Always base your answer on the session’s existing calculations and chats.
- Total Cost already includes Markup. Do not add markup twice.
- Show 1–2 suggested selling prices if asked about pricing.
- Translate markup % into peso value (e.g., "200% adds ₱80").
- Tie advice directly to the product name and Total Cost from the most recent calculation.
- Be practical, like a small business owner friend giving advice.
`


  if (calculations.length > 0) {
    context += "\nRecent calculations:\n"
    calculations.slice(-10).forEach((c, i) => {
      const timeStr = `${c.printHours || 0}h ${c.printMinutes || 0}m`
      context += `| #${i + 1} | ${c.product} | ${c.material} | ${c.weightGrams}g | ₱${c.pricePerSpool}/kg | ${timeStr} | ₱${c.electricityCost} | ${c.markupPercent}% | ₱${c.totalCost} |\n`
    })
    context += "\nColumns: # | Product | Material | Weight | Filament Price | Print Time | Electricity | Markup | Total Cost\n"
  }


  if (chats.length > 0) {
    const recentChats = chats.slice(-5)
    context += "\nRecent chat history:\n"
    recentChats.forEach(chat => {
      context += `${chat.role === "assistant" ? "Chatbot" : "User"}: ${chat.message}\n`
    })
  }


  context += `\nUser asks: ${message}\n`

  try {
    const result = await flashLiteModel.generateContent(context)
    return result.response.text() // markdown formatted
  } catch (err) {
    console.error("❌ Gemini Flash-Lite API error:", err)
    throw err
  }
}
