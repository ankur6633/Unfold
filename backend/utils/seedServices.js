import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "../models/Service.js";

dotenv.config();

const services = [
  { name: "🔹👕 Wash & Fold", priceType: "kg", basePrice: 35, description: "Premium wash and expert folding care." },
  { name: "🔹👔 Wash & Iron", priceType: "kg", basePrice: 40, description: "Wash and professional steam ironing." },
  { name: "🔹🧴✨ Dettol Wash", priceType: "kg", basePrice: 50, description: "Hygienic wash with Dettol disinfectant." },
  { name: "🔹👞 Shoes", priceType: "pair", basePrice: 50, description: "Professional shoe cleaning and restoration." },
  { name: "🔹🛏 Bedsheet", priceType: "piece", basePrice: 30, description: "Deep cleaning for crisp, fresh bedsheets." },
  { name: "🔹🧥 Jacket", priceType: "piece", basePrice: 50, description: "Specialized care for all types of jackets." },
  { name: "🔹🧶 Woollen", priceType: "kg", basePrice: 40, description: "Gentle care for your delicate woollens." },
  { name: "🔹🛌 Blanket", priceType: "kg", basePrice: 50, description: "Deep wash and sanitization for blankets." },
  { name: "🔸🤵 Full Formal (Coat+Tie+Shirt+Pant)", priceType: "bundle", basePrice: 150, description: "The ultimate formal wear care package." },
  { name: "🔸✨ Stain / Premium Wash", priceType: "piece", basePrice: 30, description: "Advanced stain removal and premium treatment." },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in .env");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    for (const s of services) {
      console.log(`Seeding: ${s.name}...`);
      await Service.findOneAndUpdate(
        { name: s.name },
        s,
        { upsert: true, new: true }
      );
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:");
    console.error(err);
    process.exit(1);
  }
};

seedDB();
