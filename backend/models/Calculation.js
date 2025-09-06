import mongoose from "mongoose"

const calculationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  material: String,
  product: String,
  pricePerSpool: Number,
  weightGrams: Number,
  printTimeHours: Number,
  electricityCost: Number,
  markupPercent: Number,
  totalCost: Number,
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
  }
}, { timestamps: true })

// TTL index (Mongo will auto delete after expiresAt)
calculationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("Calculation", calculationSchema)
