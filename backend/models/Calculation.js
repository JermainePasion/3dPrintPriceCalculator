// models/Calculation.js
import mongoose from "mongoose"

const calculationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // anonymous session
  material: String,
  weightGrams: Number,
  printTimeHours: Number,
  electricityCost: Number,
  markupPercent: Number,
  totalCost: Number
}, { timestamps: true })

export default mongoose.model("Calculation", calculationSchema)
