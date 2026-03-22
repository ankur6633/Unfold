import mongoose from 'mongoose';

export async function connectDB() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in environment variables.');
    return; // Don't exit
  }

  try {
    await mongoose.connect(MONGO_URI);
    // Success is logged in server.js .then()
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err?.message || err);
    throw err; // Re-throw to be caught in server.js .catch()
  }
}

