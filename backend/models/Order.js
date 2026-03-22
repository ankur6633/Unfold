import mongoose from "mongoose";

const ServiceItemGroupSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    serviceName: { type: String, required: true },
    priceType: { type: String, required: true },
    basePrice: { type: Number, required: true },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      }
    ],
    serviceTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String, required: true, trim: true, index: true },
    items: { type: [ServiceItemGroupSchema], default: [] },
    totalPrice: { type: Number, required: true, min: 0 },
    pickupAddress: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    customerName: { type: String },
    customerPhone: { type: String },
    alternatePhone: { type: String },
    status: {
      type: String,
      enum: ["Booked", "Pickup", "Washing", "Washed", "Delivered"],
      default: "Booked",
    },
    pickupDate: { type: String },
    pickupTime: { type: String },
    deliveryDate: { type: String },
    deliveryTime: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);

