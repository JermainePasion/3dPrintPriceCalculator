import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const flashLiteModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })


let lastCall = 0
const MIN_DELAY = 2000 

export async function askGemini(message, calculations = [], chats = []) {
  // 🚦 Rate limiting
  const now = Date.now()
  if (now - lastCall < MIN_DELAY) {
    const wait = ((MIN_DELAY - (now - lastCall)) / 1000).toFixed(1)
    throw new Error(`⚠️ Too many requests. Please wait ${wait}s before trying again.`)
  }
  lastCall = now


  let context = `
You are  a chatbot assistant for small Filipino business owners 
who use 3D printing to sell products on Shopee/Lazada/Facebook Marketplace.
- Keep answers short (3–  5 sentences).
- Use clear, simple English (Taglish suggestions are okay for prices, e.g. "₱120 per item").
- Always summarize calculation them neatly in a bullet list before answering.
- Always base your answer on the session's existing calculations. Do not ask for more details unless provided.
- If user asks about pricing/markup, suggest practical business tips (like shipping, packaging, Shopee fees) Be specific and give an example.
- According to Makerlab Electronics and Meralco (as of April 4, 2025), for a Bambu Lab A1 Combo, an hour of printing costs around ₱1.43 to ₱1.68 per hour. 
Use that as a reference if asked about electricity costs.
- If question is unrelated to 3D printing business, politely redirect.
- you are limited to saving up to 10 recent calculations
`

  // Only include last 3 calculations
   if (calculations.length > 0) {
    context += "\nRecent calculations:\n";
    calculations.slice(-10).forEach((c, i) => {
      const timeStr = `${c.printHours || 0}h ${c.printMinutes || 0}m`;
      context += `| #${i + 1} | ${c.product} | ${c.material} | ${c.weightGrams}g | ₱${c.pricePerSpool}/kg | ${timeStr} | ₱${c.electricityCost} | ${c.markupPercent}% | ₱${c.totalCost} |\n`;
    });
    context += "\nColumns: # | Product | Material | Weight | Filament Price | Print Time | Electricity | Markup | Total Cost\n";
  }

  // Only include last 5 messages
  if (chats.length > 0) {
    const recentChats = chats.slice(-5);
    context += "\nRecent chat history:\n";
    recentChats.forEach(chat => {
      context += `${chat.role === "assistant" ? "PrintMate" : "User"}: ${chat.message}\n`;
    });
  }

  context += `\nUser asks: ${message}\n`

  try {
    const result = await flashLiteModel.generateContent(context);
    return result.response.text(); // Markdown formatted
  } catch (err) {
    console.error("❌ Gemini Flash-Lite API error:", err);
    throw err;
  }
}