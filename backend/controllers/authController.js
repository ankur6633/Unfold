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

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to DB
    const { default: Otp } = await import("../models/Otp.js");
    await Otp.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true });

    // Send email
    const { sendOtpEmail } = await import("../utils/mailer.js");
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP." });
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

    res.status(200).json({ email: user.email, role: user.role, cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile." });
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

