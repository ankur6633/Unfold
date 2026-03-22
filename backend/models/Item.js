import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unitType: { 
      type: String, 
      required: true, 
      enum: ["piece", "pair", "kg"] 
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Item", ItemSchema);
