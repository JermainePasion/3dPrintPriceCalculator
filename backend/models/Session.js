// models/Session.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const sessionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() }, // ✅ UUID string instead of ObjectId
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);
