import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export function isMongoConnected() {
  return !!MONGODB_URI && mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    console.log('No MONGODB_URI set – using JSON file storage');
    return null;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}
