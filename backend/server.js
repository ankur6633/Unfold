import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

console.log("🚀 Starting server...");
console.log("ENV PORT:", process.env.PORT);

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

const app = express();

// Health check route
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Middleware
app.use(express.json());
app.use(cors());

// Connect routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (_req, res) => {
  res.json({ message: 'Laundry Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File is too large. Max limit is 10MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  
  res.status(err.status || 500).json({
    message: err.message || "Internal server error."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

async function initializeServices() {
  try {
    // Configure Cloudinary (module-side config).
    await import('./config/cloudinary.js');

    // Connect MongoDB (non-blocking).
    const { connectDB } = await import('./config/db.js');
    connectDB()
      .then(() => console.log("✅ DB connected"))
      .catch((err) => console.error("❌ DB connection failed:", err));

  } catch (err) {
    console.error("❌ Service initialization failed:", err);
  }
}

initializeServices();

