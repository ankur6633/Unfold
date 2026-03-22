import mongoose from "mongoose";

const ServiceItemSchema = new mongoose.Schema(
  {
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Service", 
      required: true 
    },
    itemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Item", 
      required: true 
    },
    priceOverride: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure unique mapping per service/item
ServiceItemSchema.index({ serviceId: 1, itemId: 1 }, { unique: true });

export default mongoose.model("ServiceItem", ServiceItemSchema);
