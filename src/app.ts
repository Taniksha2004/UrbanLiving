import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import passport from 'passport'; // Import passport
import serviceRoutes from "./routes/service.routes";
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import userRoutes from './routes/user.routes';
import profileRoutes from './routes/profile.routes';
import messageRoutes from './routes/message.routes';
import billRoutes from './routes/bill.routes'; // ✅ Import bill routes
import path from 'path';

dotenv.config();

const app = express();

// Passport configuration (needed for Google OAuth)
import './config/passport';

// CORS settings for frontend access
app.use(cors({

    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));

// Middleware for parsing incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport middleware
app.use(passport.initialize());

// Serve avatar images statically from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Register other API routes
app.use("/api/services", serviceRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/bills', billRoutes); // ✅ Register bill routes

app.use('/api/messages', messageRoutes);

// (Optional) Health check route or default route
app.get('/', (req, res) => { res.send('🟢 Server is running');
});

export default app;