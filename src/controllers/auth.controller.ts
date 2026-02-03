import { RequestHandler } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// --- User Registration with Password Hashing ---
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save the new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Save the hashed password
      userType,
    });
    
    await newUser.save();

    // Don't send the password back in the response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};


// --- User Login with JWT Creation ---
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const SECRET_KEY = process.env.JWT_SECRET;
    
    if (!SECRET_KEY) {
      throw new Error('JWT_SECRET is not defined.');
    }

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare submitted password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. **Create JWT Payload** (This is the crucial new part)
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType || 'student', // Provide a default or ensure it's set
    };

    // 4. **Sign the Token**
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' }); // Token expires in 1 day

    // 5. Send the token back to the client
    res.status(200).json({ 
      message: 'Login successful', 
      token: token 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};