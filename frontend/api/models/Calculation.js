import mongoose from "mongoose"

const calculationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  material: String,
  product: String,
  pricePerSpool: Number, 
  weightGrams: Number,   
  printHours: Number,     
  printMinutes: Number,   
  electricityCost: Number, // cost per hour (₱/hour)
  markupPercent: Number,
  totalCost: Number,      
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  }
}, { timestamps: true })


calculationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })


calculationSchema.pre("save", function (next) {

  const totalPrintTimeHours = this.printHours + (this.printMinutes / 60)


  const filamentCostPerGram = this.pricePerSpool / 1000
  const filamentCost = filamentCostPerGram * this.weightGrams


  const electricityTotal = this.electricityCost * totalPrintTimeHours


  const baseCost = filamentCost + electricityTotal


  this.totalCost = baseCost * (1 + this.markupPercent / 100)

  next()
})

export default mongoose.model("Calculation", calculationSchema)
