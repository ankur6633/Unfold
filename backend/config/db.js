import mongoose from 'mongoose';

export async function connectDB() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error('MONGO_URI is missing in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err?.message || err);
    process.exit(1);
  }
}

