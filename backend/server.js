import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);

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

async function startServer() {
  // Configure Cloudinary (module-side config).
  await import('./config/cloudinary.js');

  // Connect MongoDB.
  const { connectDB } = await import('./config/db.js');
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

startServer();

