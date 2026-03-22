import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    priceType: { 
      type: String, 
      required: true, 
      enum: ["kg", "piece", "pair", "bundle"] 
    },
    basePrice: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Service", ServiceSchema);
