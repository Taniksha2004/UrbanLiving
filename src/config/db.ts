// src/config/db.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in your .env file.');
    process.exit(1); // Exit the application with a failure code
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit the application on connection failure
  }
};

export default connectDB;