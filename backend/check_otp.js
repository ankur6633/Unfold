import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Users/ankur/Documents/unfold/backend/.env" });

async function checkOtp() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const otpSchema = new mongoose.Schema({ email: String, otp: String, createdAt: Date });
    const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
    
    const otps = await Otp.find().sort({ createdAt: -1 }).limit(5);
    console.log("Recent OTPs:", otps);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOtp();
