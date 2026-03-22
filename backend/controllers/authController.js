import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body ?? {};
    console.log("Login payload received:", { email, passwordLength: password?.length });

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
    const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
    const jwtSecret = (process.env.JWT_SECRET || "").trim();

    console.log("Admin Login Attempt (sanitized):", { email, adminEmail, hasHash: !!adminPasswordHash, hashLength: adminPasswordHash.length });

    if (!adminEmail || !adminPasswordHash || !jwtSecret) {
      const msg = `Misconfiguration detected: adminEmail=${!!adminEmail}, adminPasswordHash=${!!adminPasswordHash}, jwtSecret=${!!jwtSecret}`;
      console.log(msg);
      try {
        const fs = await import('fs');
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${msg}\n`);
      } catch (e) {}
      // Misconfiguration: do not leak details to the client.
      return res.status(500).json({ message: "Server misconfigured." });
    }

    // Requirement: email must match exactly
    if (email !== adminEmail) {
      console.log("Email mismatch:", { provided: email, expected: adminEmail });
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log("Comparing password...");
    try {
      const passwordMatches = await bcrypt.compare(password, adminPasswordHash);
      console.log("Password compare result:", passwordMatches);
      
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    } catch (compErr) {
      console.error("Bcrypt compare error:", compErr);
      throw compErr;
    }

    const payload = { role: "admin", email };
    console.log("Signing JWT...");
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
    console.log("Login successful, token generated.");

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Admin Login Error:", err);
    try {
      const fs = await import('fs');
      fs.appendFileSync('error.log', `[${new Date().toISOString()}] Admin Login Error: ${err.stack}\n`);
    } catch (e) {
      console.error("Failed to write to error.log", e);
    }
    // Keep response generic for production safety.
    return res.status(500).json({ message: "Internal server error." });
  }
}

import { sendOtpEmail } from "../utils/mailer.js";
import Otp from "../models/Otp.js";
import User from "../models/User.js";

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      console.log("OTP Request Failed: No email provided");
      return res.status(400).json({ message: "Email is required." });
    }

    console.log(`Step 1: Generating OTP for ${email}`);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 1. Instantly save OTP to DB (Primary Action)
    console.log(`Step 2: Saving OTP to DB for ${email}`);
    await Otp.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true });
    console.log(`Step 3: OTP saved successfully for ${email}`);

    // 2. Respond to user IMMEDIATELY (Speed Optimization)
    res.status(200).json({ message: "OTP sent successfully." });

    // 3. Fire email in background (Asynchronous)
    console.log(`Step 4: Launching background email task for ${email}`);
    sendOtpEmail(email, otp)
      .then(() => {
        console.log(`Step 5: Background email sent successfully to ${email}`);
      })
      .catch(err => {
        console.error(`Step 5: Background OTP Email FAILURE for ${email}:`, err.message);
        console.error("Full Error:", err);
      });

  } catch (err) {
    console.error("Critical Send OTP Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to send OTP." });
    }
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

    const { default: Otp } = await import("../models/Otp.js");
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // OTP verified, find or create user
    const { default: User } = await import("../models/User.js");
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

    // Delete OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ token, user: { email: user.email, role: user.role, cart: user.cart } });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Failed to verify OTP." });
  }
}

export async function googleLogin(req, res) {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const { default: User } = await import("../models/User.js");
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

    res.status(200).json({ token, user: { email: user.email, role: user.role, cart: user.cart } });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Failed to login with Google." });
  }
}

export async function getProfile(req, res) {
  try {
    const { default: User } = await import("../models/User.js");
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ 
      email: user.email, 
      fullName: user.fullName || "",
      mobile: user.mobile || "",
      altMobile: user.altMobile || "",
      addresses: user.addresses || [],
      role: user.role, 
      cart: user.cart 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile." });
  }
}

export async function updateProfile(req, res) {
  try {
    const { fullName, mobile, altMobile } = req.body;
    const { default: User } = await import("../models/User.js");
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, mobile, altMobile },
      { new: true }
    );

    res.status(200).json({ 
      fullName: user.fullName, 
      mobile: user.mobile, 
      altMobile: user.altMobile 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile." });
  }
}

export async function addAddress(req, res) {
  try {
    const { label, line1, line2, city, state, pincode, isDefault } = req.body;
    const { default: User } = await import("../models/User.js");
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // If this is the first address or marked as default, unset other defaults
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ 
      label, 
      line1, 
      line2, 
      city, 
      state, 
      pincode, 
      isDefault: isDefault || user.addresses.length === 0 
    });
    
    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to add address." });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const { default: User } = await import("../models/User.js");
    
    const user = await User.findById(req.user.userId);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    
    // If we deleted the default address, make the first one default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address." });
  }
}

export async function setDefaultAddress(req, res) {
  try {
    const { addressId } = req.params;
    const { default: User } = await import("../models/User.js");
    
    const user = await User.findById(req.user.userId);
    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to set default address." });
  }
}

export async function updateCart(req, res) {
  try {
    const { cart } = req.body;
    const { default: User } = await import("../models/User.js");
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { cart },
      { new: true }
    );

    res.status(200).json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart." });
  }
}

export async function getCart(req, res) {
  try {
    const { default: User } = await import("../models/User.js");
    const user = await User.findById(req.user.userId);
    res.status(200).json({ cart: user.cart || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart." });
  }
}

