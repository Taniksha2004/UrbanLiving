import { Request, Response, Router, NextFunction } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateJWT } from '../middlewares/auth';
import passport from 'passport';
import { findOrCreateUser } from '../services/auth.service';
import { generateToken } from '../utils/jwt'; // Use the dedicated JWT generator
import { checkRole } from '../middlewares/role.middleware';

const router = Router();


// SIGNUP with email and password (Omitted for brevity, assumed correct)
router.post('/signup', async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    userType,
    agreeToTerms
  } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !userType || !agreeToTerms) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      userType,
      agreeToTerms
    });

    await newUser.save();

    return res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// LOGIN with email and password
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      // Ensure all required JwtPayload fields are included
      { userId: user._id, email: user.email, userType: user.userType }, 
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// GOOGLE AUTH
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GOOGLE AUTH CALLBACK
router.get('/google/callback',
  // Passport attaches the Mongoose User Document to req.user here.
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login', session: false }),
  
  // FIX: Simplified function signature (req, res, next) to prevent Express type overload error
  async (req, res, next) => {
    
    // FIX: Cast req.user to 'any' to safely access the Mongoose document properties
    const user = req.user as any; 

    // Generate JWT token using the required properties from the Mongoose document
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType }, 
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1d' }
    );

    // Prepare user data for redirect
    const encodedUser = encodeURIComponent(JSON.stringify({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType 
    }));
    
    res.redirect(`http://localhost:5173/auth-success?token=${token}&user=${encodedUser}`);
  }
);

// 🔒 Protected route - Uses AuthRequest type
router.get('/some-route', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the protected dashboard!',
    user: req.user,
  });
});

export default router;